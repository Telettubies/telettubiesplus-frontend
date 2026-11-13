import React, { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { useAuth } from '@/shared/hooks/useAuth';
import type { MatrixItem } from '@/api/backend';
import { cachedPdf, fetchPdf } from './pdfTransport';
import { services } from './services';
import { ErrorBox, Loading } from './common';
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
export function RealPdf({ id, url, item, jump }: {
    id: string;
    url: string;
    item: MatrixItem | null;
    jump?: number | null;
}) {
    const { user } = useAuth();
    const key = `${user?.user_id}:${user?.organizacion_id}:${id}`;
    const [blob, setBlob] = useState<Blob | null>(() => cachedPdf(key) || null);
    const [error, setError] = useState<unknown>(null);
    const [version, retry] = useState(0);
    const [loading, setLoading] = useState(!blob);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [width, setWidth] = useState(550);
    const host = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (item)
            setPage(item.ubicacion.pagina);
    }, [item?.id, item?.ubicacion.pagina]);
    useEffect(() => {
        if (jump)
            setPage(jump);
    }, [jump]);
    useEffect(() => {
        const node = host.current;
        if (!node)
            return;
        const observe = () => setWidth(Math.max(240, Math.min(node.clientWidth - 32, 1000)));
        observe();
        const o = new ResizeObserver(observe);
        o.observe(node);
        return () => o.disconnect();
    }, []);
    useEffect(() => {
        const controller = new AbortController();
        const existing = cachedPdf(key);
        if (existing) {
            setBlob(existing);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        async function load() {
            try {
                let result: Blob;
                try {
                    result = await fetchPdf(url, controller.signal, key);
                }
                catch (e) {
                    if (controller.signal.aborted)
                        return;
                    const fresh = await services.pdfUrl(id);
                    if (controller.signal.aborted)
                        return;
                    result = await fetchPdf(fresh, controller.signal, key);
                }
                if (!controller.signal.aborted)
                    setBlob(result);
            }
            catch (e) {
                if (!controller.signal.aborted)
                    setError(e);
            }
            finally {
                if (!controller.signal.aborted)
                    setLoading(false);
            }
        }
        void load();
        return () => controller.abort();
    }, [key, url, id, version]);
    return <section className="card" style={{ padding: 14 }}><h2>Pliego original</h2><div className="row"><button disabled={page <= 1} onClick={() => setPage(n => n - 1)} aria-label="Página anterior">←</button><label>Página<input aria-label="Página del PDF" type="number" min={1} max={pages || undefined} value={page} style={{ width: 90 }} onChange={e => setPage(Math.max(1, Math.min(pages || 1, Number(e.target.value) || 1)))}/></label><span>de {pages || '…'}</span><button disabled={!pages || page >= pages} onClick={() => setPage(n => n + 1)} aria-label="Página siguiente">→</button><label>Zoom<select value={zoom} onChange={e => setZoom(Number(e.target.value))}>{[.75, 1, 1.25, 1.5, 2].map(z => <option key={z} value={z}>{z * 100}%</option>)}</select></label></div>
    {item && item.ubicacion.precision !== 'exacta' && <p className="notice warning">{item.ubicacion.precision === 'solo_pagina' ? 'Ubicación disponible solo por página; no hay zonas exactas para resaltar.' : 'Ubicación aproximada: contrasta el texto con el original.'}</p>}
    <ErrorBox error={error}/>{!!error && <button onClick={() => retry(v => v + 1)}>Reintentar descarga</button>}{loading && <Loading />}
    <div ref={host} className="pdf-stage">{blob && <Document file={blob} loading={<Loading />} onLoadSuccess={({ numPages }) => { setPages(numPages); setPage(p => Math.min(p, numPages)); }} onLoadError={() => setError(new Error('No se pudo abrir el PDF.'))}><div className="pdf-sheet"><Page pageNumber={page} width={width * zoom} renderAnnotationLayer={false} renderTextLayer={false} onRenderError={() => setError(new Error('No se pudo mostrar esta página.'))}/>{item?.ubicacion.precision !== 'solo_pagina' && item?.ubicacion.zonas.filter(z => z.pagina === page).map((z, i) => <div className="pdf-highlight" key={i} title={`Numeral ${item.numeral}`} style={{ left: `${z.x * 100}%`, top: `${z.y * 100}%`, width: `${z.width * 100}%`, height: `${z.height * 100}%` }}/>)}</div></Document>}</div>
  </section>;
}
