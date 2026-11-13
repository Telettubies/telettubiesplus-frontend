import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CompanyDocuments, combinarBase } from '../CompanyDocuments';
import { axiosClient } from '@/api/axiosClient';

test('incorpora datos sin borrar registros existentes y actualiza un identificador repetido', () => {
  const base = { empresa: { razon_social: 'Empresa', nit: '900123456' }, contratos: [{ id: 'uno', valor_cop: 100 }], personas: [{ id: 'persona' }] };
  const resultado = combinarBase(base, [{ tipo: 'contrato', pagina: 1, cita: 'Contrato', datos: { id: 'uno', valor_cop: 200 } }]);
  expect(resultado.contratos).toEqual([{ id: 'uno', valor_cop: 200 }]);
  expect(resultado.personas).toEqual(base.personas);
  expect(base.contratos[0].valor_cop).toBe(100);
});

test('un revisor puede consultar documentos pero no recibe controles de carga o aprobación', async () => {
  jest.spyOn(axiosClient, 'get').mockResolvedValue({ data: [] });
  render(<CompanyDocuments canEdit={false}/>);
  await waitFor(() => expect(axiosClient.get).toHaveBeenCalled());
  expect(screen.queryByLabelText('Agregar PDF')).not.toBeInTheDocument();
  expect(screen.queryByText('Aprobar e indexar')).not.toBeInTheDocument();
  jest.restoreAllMocks();
});

test('carga el PDF con FormData y no aprueba automáticamente', async () => {
  jest.spyOn(axiosClient, 'get').mockResolvedValue({ data: [] });
  const post = jest.spyOn(axiosClient, 'post').mockResolvedValue({ data: {} });
  render(<CompanyDocuments canEdit/>);
  fireEvent.change(screen.getByLabelText('Agregar PDF'), { target: { files: [new File(['%PDF-'], 'empresa.pdf', { type: 'application/pdf' })] } });
  await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
  expect(post.mock.calls[0][0]).toBe('/conocimiento/documentos');
  expect(post.mock.calls[0][1]).toBeInstanceOf(FormData);
  jest.restoreAllMocks();
});
