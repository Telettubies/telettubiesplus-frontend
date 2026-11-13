import React, { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import 'react-pdf/dist/Page/TextLayer.css';
import { useAuth } from '@/shared/hooks/useAuth';
import type { ItemVerificable } from '@/api/types';
import { cachedPdf, fetchPdf } from '@/features/connected/pdfTransport';
import { services } from '@/features/connected/services';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

interface OriginalPdfCanvasProps {
  id: string;
  url?: string;
  item: ItemVerificable | null;
  page: number;
  zoom: number;
  onPages: (count: number) => void;
  search?: string;
  onPage?: (page: number) => void;
}

export function OriginalPdfCanvas({ id, url, item, page, zoom, onPages, search = '', onPage }: OriginalPdfCanvasProps) {
  const { user } = useAuth();
  const key = `${user?.user_id}:${user?.organizacion_id}:${id}`;
  const [blob, setBlob] = useState<Blob | null>(() => cachedPdf(key) || null);
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState('');
  const [searchMessage, setSearchMessage] = useState('');
  const [revision, retry] = useState(0);
  const [width, setWidth] = useState(650);
  const host = useRef<HTMLDivElement>(null);
  const onPageRef = useRef(onPage);
  onPageRef.current = onPage;

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const resize = () => setWidth(Math.max(220, Math.min(element.clientWidth, 780)));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const cached = cachedPdf(key);
    setBlob(cached || null);
    setDocument(null);
    setError('');
    if (cached) return;
    const load = async () => {
      try {
        const initial = url || await services.pdfUrl(id);
        if (controller.signal.aborted) return;
        let content: Blob;
        try {
          content = await fetchPdf(initial, controller.signal, key);
        } catch {
          if (controller.signal.aborted) return;
          const renewed = await services.pdfUrl(id);
          if (controller.signal.aborted) return;
          content = await fetchPdf(renewed, controller.signal, key);
        }
        if (!controller.signal.aborted) setBlob(content);
      } catch (cause) {
        if (!controller.signal.aborted) setError((cause as Error).message || 'No se pudo descargar el PDF.');
      }
    };
    void load();
    return () => controller.abort();
  }, [id, key, url, revision]);

  useEffect(() => {
    setSearchMessage('');
    const query = search.trim().toLocaleLowerCase();
    if (!document || !query) return;
    let alive = true;
    const timer = setTimeout(async () => {
      try {
        for (let number = 1; number <= document.numPages; number++) {
          if (!alive) return;
          const pdfPage = await document.getPage(number);
          const content = await pdfPage.getTextContent();
          if (!alive) return;
          const text = content.items.map(part => 'str' in part ? part.str : '').join(' ').toLocaleLowerCase();
          if (text.includes(query)) {
            onPageRef.current?.(number);
            return;
          }
        }
        if (alive) setSearchMessage('No se encontró el texto en las páginas con texto seleccionable.');
      } catch {
        if (alive) setSearchMessage('No se pudo buscar texto en este documento.');
      }
    }, 300);
    return () => { alive = false; clearTimeout(timer); };
  }, [document, search]);

  const zones = item?.backend_item?.ubicacion.zonas || item?.ubicacion.zonas.map(zone => ({ ...zone, pagina: item?.ubicacion.pagina || 1 })) || [];
  const visiblePage = Math.max(1, Math.min(page, document?.numPages || page || 1));

  return <div ref={host} className="w-full min-w-0 overflow-auto">
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">{error}<button className="ml-3 underline" onClick={() => retry(value => value + 1)}>Reintentar</button></div>}
    {searchMessage && <p role="status" className="p-2 text-xs text-slate-500">{searchMessage}</p>}
    {!blob && !error && <p role="status" className="p-8 text-xs text-slate-500">Cargando pliego original…</p>}
    {blob && <Document file={blob} onLoadSuccess={pdf => { setDocument(pdf); onPages(pdf.numPages); }} onLoadError={() => setError('No se pudo abrir el PDF.')} loading={<p className="p-6 text-xs">Preparando documento…</p>}>
      <div className="relative mx-auto w-fit bg-white shadow-md">
        <Page pageNumber={visiblePage} width={width * zoom / 100} renderAnnotationLayer={false} renderTextLayer={true} onRenderError={() => setError('No se pudo mostrar esta página.')}/>
        {item?.ubicacion.precision !== 'solo_pagina' && zones.filter(zone => zone.pagina === visiblePage).map((zone, index) => <div key={index} className="pointer-events-none absolute border border-amber-500 bg-yellow-300/40" style={{ left: `${zone.x * 100}%`, top: `${zone.y * 100}%`, width: `${zone.width * 100}%`, height: `${zone.height * 100}%` }}/>) }
      </div>
    </Document>}
  </div>;
}
