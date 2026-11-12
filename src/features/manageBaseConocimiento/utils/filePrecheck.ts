const MAX_KNOWLEDGE_BYTES = 50 * 1024 * 1024; // 50 MB

export function validateKnowledgeFile(file: File): { valid: boolean; reason?: string } {
  const lower = file.name.toLowerCase();
  if (!lower.endsWith('.json') && !lower.endsWith('.zip')) {
    return {
      valid: false,
      reason: 'Formato inválido. Solo se aceptan paquetes estructurados .JSON o .ZIP (contratos.json v0.3).',
    };
  }
  if (file.size > MAX_KNOWLEDGE_BYTES) {
    return {
      valid: false,
      reason: 'El archivo supera el límite máximo permitido de 50 MB.',
    };
  }
  return { valid: true };
}

