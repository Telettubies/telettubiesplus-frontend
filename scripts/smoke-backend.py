"""FastAPI real + PostgreSQL desechable; proveedores externos y cola simulados.
Ejecutar con el Python del backend. Solo escucha en loopback:18001.
Ctrl+C elimina exclusivamente la base nueva creada por esta ejecución.
"""
import asyncio
import contextlib
import os
from pathlib import Path
import sys
import uuid
from datetime import datetime, timezone

BACK = Path(__file__).resolve().parents[2] / 'telettubiesplus-backend'
sys.path[:0] = [str(BACK), str(BACK / 'src')]
from dotenv import dotenv_values
from sqlalchemy.engine import make_url
import psycopg
from psycopg import sql

local = dotenv_values(BACK / '.env')
source = make_url(local['DATABASE_URL'])
assert source.host in ('localhost', '127.0.0.1', '::1'), 'Solo PostgreSQL local'
name = 'analizador_smoke_' + uuid.uuid4().hex[:8] + '_test'
url = source.set(host='127.0.0.1', database=name, drivername='postgresql+asyncpg')
os.environ.update(DATABASE_URL=url.render_as_string(hide_password=False), TEST_DATABASE_URL=url.render_as_string(hide_password=False), APP_ENV='test', CORS_ORIGINS='http://localhost:5181', RABBITMQ_URL='amqp://test:test@localhost:1/', SUPABASE_URL='https://proyecto-test.supabase.co', SUPABASE_STORAGE_BUCKET='test', SUPABASE_SERVICE_ROLE_KEY='', ANTHROPIC_API_KEY='', NVIDIA_API_KEY='', MAX_PDF_MB='25')
metadata=Path(__file__).resolve().parents[1]/'test-results'/'smoke-database.txt'
metadata.parent.mkdir(exist_ok=True)
metadata.write_text(name,encoding='utf-8')
os.chdir(BACK)
from tests.integracion.conftest import _crear_base_si_falta, _migrar
from tests.apoyo import crear_organizacion, AlmacenFalso, JwksFalso, token
from tests.apoyo_analisis import crear_analisis, agregar_requisito
from analizador.api.main import create_app
from analizador.api import chat, observaciones
from analizador.integrations import supabase, almacenamiento
from analizador.db.session import get_sessionmaker, get_engine
from analizador.models import Licitacion, TrabajoProcesamiento, Seccion, Resultado, PaginaPliego, UbicacionPliego
from analizador.models.enums import EstadoLicitacion, EstadoTrabajo, EstadoCumplimiento, OrigenPagina, PrecisionUbicacion
from analizador.schemas import RespuestaChatOut, CitaChatOut, ObservacionOut
from sqlalchemy import select
import fitz
import uvicorn

store = AlmacenFalso()
for attr in ('subir_pdf', 'descargar', 'eliminar'):
    setattr(almacenamiento, attr, getattr(store, attr))
async def signed(key):
    return 'https://proyecto-test.supabase.co/storage/v1/object/sign/test/' + key + '?token=synthetic'
almacenamiento.url_temporal = signed
supabase._jwks_client = lambda: JwksFalso()
async def invite(email): return uuid.uuid4()
async def remove_user(uid): pass
supabase.invitar_usuario = invite
supabase.eliminar_usuario = remove_user
async def answer(*args):
    return RespuestaChatOut(respuesta='El numeral 3.1 exige experiencia acreditada.', encontrado=True, citas=[CitaChatOut(numeral='3.1', pagina=1)])
async def draft(licitacion, requisito, seccion):
    return ObservacionOut(requisito_id=requisito.id, numeral=requisito.numeral, asunto='Solicitud de aclaración', texto='Solicitamos aclarar el alcance del requisito del numeral 3.1.')
chat.responder = answer
observaciones.generar = draft
pdf = fitz.open()
page = pdf.new_page()
page.insert_text((60, 90), '3.1 REQUISITOS DE EXPERIENCIA')
page.insert_text((60, 120), 'El proponente debe acreditar experiencia.')
PDF = pdf.tobytes()
pdf.close()
fixtures = {}
async def complete(job_id):
    await asyncio.sleep(.7)
    async with get_sessionmaker()() as s:
        job = await s.get(TrabajoProcesamiento, job_id)
        if job.licitacion_id:
            tender = await s.get(Licitacion, job.licitacion_id)
            tender.estado = EstadoLicitacion.COMPLETADA
            tender.recomendacion = 'presentarse'
            tender.justificacion = 'Resultado sintético de integración: requisito revisado.'
        job.estado = EstadoTrabajo.COMPLETADO
        job.progreso = 100
        job.finalizado_en = datetime.now(timezone.utc)
        await s.commit()
class Queue:
    async def publicar(self, tipo, job_id):
        asyncio.create_task(complete(job_id))
async def seed():
    async with get_sessionmaker()() as s:
        who = await crear_organizacion(s, 'Empresa sintética de integración')
        analysis = await crear_analisis(s, who)
        req = await agregar_requisito(s, analysis, numeral='3.1', texto='El proponente debe acreditar experiencia.', items=['Acreditar experiencia'], ambiguo=True, motivo_ambiguedad='Debe aclararse el alcance.')
        tender = await s.get(Licitacion, analysis.licitacion_id)
        tender.titulo='Pliego de integración'
        tender.estado=EstadoLicitacion.COMPLETADA
        tender.recomendacion='condicionada'
        tender.justificacion='Hay un requisito pendiente de revisión.'
        job=await s.get(TrabajoProcesamiento, analysis.trabajo_id)
        job.estado=EstadoTrabajo.COMPLETADO
        job.progreso=100
        s.add_all([Resultado(item_id=req.items[0].id, estado=EstadoCumplimiento.CUMPLE, requiere_revision=True, motivo_revision='Verificar experiencia', evidencia=[{'tipo':'cita','fuente':'Contrato sintético','cita':'Experiencia certificada','verificada':True,'similitud':100}]), PaginaPliego(licitacion_id=tender.id,numero=1,texto='El proponente debe acreditar experiencia.',origen=OrigenPagina.DIGITAL), UbicacionPliego(requisito_id=req.id,pagina=1,precision=PrecisionUbicacion.EXACTA,zonas=[{'pagina':1,'x0':.1,'y0':.12,'x1':.7,'y1':.16}])])
        await s.commit()
        fixtures.update(tender=str(tender.id), user=str(who.usuario_id), org=str(who.organizacion_id))
        fixtures['session']={'access_token':token(who.usuario_id, exp=int(datetime.now(timezone.utc).timestamp())+3600), 'refresh_token':'synthetic-refresh', 'token_type':'bearer', 'expires_in':3600, 'user':{'id':str(who.usuario_id),'email':'usuario@ejemplo.co','aud':'authenticated','role':'authenticated','app_metadata':{},'user_metadata':{},'created_at':datetime.now(timezone.utc).isoformat()}}
@contextlib.asynccontextmanager
async def lifespan(app):
    app.state.publicador=Queue()
    await seed()
    yield
    await get_engine().dispose()
app=create_app()
app.router.lifespan_context=lifespan
@app.get('/__smoke/session')
async def fixture(): return fixtures
@app.get('/__smoke/pdf')
async def get_pdf():
    from fastapi import Response
    return Response(PDF,media_type='application/pdf')
@app.post('/__smoke/shutdown')
async def stop():
    server.should_exit=True
    return {'stopping':True}
if __name__=='__main__':
    try:
        _crear_base_si_falta(url)
        _migrar(url)
        server=uvicorn.Server(uvicorn.Config(app,host='127.0.0.1',port=18001,log_level='warning'))
        asyncio.run(server.serve())
    finally:
        assert name.startswith('analizador_smoke_') and name.endswith('_test')
        maintenance=source.set(host='127.0.0.1',database='postgres',drivername='postgresql').render_as_string(hide_password=False)
        with psycopg.connect(maintenance,autocommit=True,connect_timeout=5) as conn:
            conn.execute(sql.SQL('DROP DATABASE IF EXISTS {} WITH (FORCE)').format(sql.Identifier(name)))
        print('Base de humo temporal eliminada.')
