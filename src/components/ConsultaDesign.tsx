import React from 'react';

// Estilos compartidos para asegurar consistencia exacta
export const CONSULTA_STYLES = `
  @page { 
    margin: 15mm; 
    size: A4;
  }
  
  body {
    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    font-size: 12pt;
    color: #1a202c;
    background: #fff;
    margin: 0;
    padding: 0;
    line-height: 1.5;
  }

  .consulta-container {
    max-width: 210mm;
    margin: 0 auto;
    background: white;
    position: relative;
    min-height: 297mm; /* A4 height */
    padding: 20mm;
    box-sizing: border-box;
  }

  /* En pantalla, ajustar */
  @media screen {
    .consulta-container {
      min-height: auto;
      padding: 20px;
      width: 100%;
      max-width: 100%;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border-radius: 0.5rem;
    }
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #2563eb;
    padding-bottom: 15px;
    margin-bottom: 25px;
  }

  .clinic-info h1 {
    font-size: 24px;
    font-weight: 900;
    color: #2563eb;
    margin: 0 0 5px 0;
    text-transform: uppercase;
  }

  .clinic-info p {
    margin: 2px 0;
    font-size: 11px;
    color: #4b5563;
  }

  .vet-info {
    text-align: right;
    font-size: 11px;
    color: #4b5563;
  }

  .vet-name {
    font-size: 14px;
    font-weight: 700;
    color: #2563eb;
    margin-bottom: 2px;
  }

  .doc-title {
    text-align: center;
    font-size: 18px;
    font-weight: 800;
    color: #1e40af;
    margin: 20px 0;
    text-transform: uppercase;
    letter-spacing: 2px;
    background: #f0f9ff;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #bae6fd;
  }

  .section-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
  }

  .patient-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .info-row {
    margin-bottom: 5px;
    font-size: 13px;
  }

  .label {
    font-weight: 700;
    color: #4b5563;
    margin-right: 5px;
  }

  .value {
    color: #111827;
    font-weight: 500;
  }

  .detail-section {
    margin-bottom: 20px;
  }

  .detail-title {
    font-size: 14px;
    font-weight: 700;
    color: #2563eb;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 5px;
    margin-bottom: 10px;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .detail-content {
    font-size: 13px;
    color: #374151;
    line-height: 1.6;
    white-space: pre-wrap;
    background: #fff;
    padding: 10px;
    border-radius: 6px;
    border: 1px solid #f3f4f6;
  }

  .empty-content {
    color: #9ca3af;
    font-style: italic;
  }

  .footer {
    margin-top: 50px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    page-break-inside: avoid;
  }

  .signature-box {
    text-align: center;
    width: 200px;
  }

  .signature-line {
    border-top: 1px solid #1f2937;
    padding-top: 5px;
    font-size: 11px;
    color: #4b5563;
  }

  .date-badge {
    display: inline-block;
    background: #eff6ff;
    color: #1e40af;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid #bfdbfe;
  }
`;

export const ConsultaTemplate = ({ consulta, mascota, veterinario, isPreview = false }: any) => {
    const fecha = consulta.fecha ? new Date(consulta.fecha) : new Date();
    const fechaStr = fecha.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });

    const proximoControl = consulta.proximo_control ? new Date(consulta.proximo_control).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

    return (
        <div className={`consulta-container ${isPreview ? 'preview-mode' : ''}`}>
            <div className="header">
                <div className="clinic-info">
                    <h1>Clínica Veterinaria Pucará</h1>
                    <p>Esmeralda N° 97, San Bernardo</p>
                    <p>Fono: 22859 2840 / Whatsapp: +56 9 39246250</p>
                    <p>Email: contacto@veterinariapucara.cl</p>
                </div>
                <div className="vet-info">
                    <div className="vet-name">{veterinario?.nombre || 'Dra. Pilar Zoccola Segovia'}</div>
                    <div>Médico Veterinario</div>
                    {veterinario?.especialidad && <div>{veterinario.especialidad}</div>}
                    <div style={{ marginTop: '10px' }}>
                        <span className="date-badge">{fechaStr}</span>
                    </div>
                </div>
            </div>

            <div className="doc-title">Consulta Médica #{consulta.id}</div>

            <div className="section-box">
                <div className="patient-grid">
                    <div className="info-row">
                        <span className="label">Paciente:</span>
                        <span className="value">{mascota?.nombre}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Especie:</span>
                        <span className="value">{mascota?.especie ? 'Gato' : 'Perro'}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Raza:</span>
                        <span className="value">{mascota?.raza || '-'}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Sexo:</span>
                        <span className="value">{mascota?.sexo === true ? 'Macho' : mascota?.sexo === false ? 'Hembra' : '-'}</span>
                    </div>
                    <div className="info-row" style={{ gridColumn: '1 / -1' }}>
                        <span className="label">Propietario:</span>
                        <span className="value">{mascota?.propietario?.nombre} {mascota?.propietario?.apellido}</span>
                    </div>
                </div>
            </div>

            <div className="detail-section">
                <div className="detail-title">📋 Motivo de Consulta</div>
                <div className="detail-content">
                    {consulta.motivo || <span className="empty-content">No especificado</span>}
                </div>
            </div>

            <div className="detail-section">
                <div className="detail-title">📝 Anamnesis</div>
                <div className="detail-content">
                    {consulta.anamnesis || <span className="empty-content">No especificado</span>}
                </div>
            </div>

            <div className="detail-section">
                <div className="detail-title">🔍 Diagnóstico</div>
                <div className="detail-content">
                    {consulta.diagnostico || <span className="empty-content">No especificado</span>}
                </div>
            </div>

            <div className="detail-section">
                <div className="detail-title">💊 Tratamiento</div>
                <div className="detail-content">
                    {consulta.tratamiento || <span className="empty-content">No especificado</span>}
                </div>
            </div>

            {consulta.observaciones && (
                <div className="detail-section">
                    <div className="detail-title">💭 Observaciones</div>
                    <div className="detail-content">
                        {consulta.observaciones}
                    </div>
                </div>
            )}

            {proximoControl && (
                <div className="detail-section" style={{ marginTop: '30px', background: '#f0f9ff', padding: '15px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                    <div className="detail-title" style={{ borderBottom: 'none', marginBottom: '5px', color: '#0369a1' }}>📅 Próximo Control</div>
                    <div className="detail-content" style={{ background: 'transparent', border: 'none', padding: 0, fontSize: '16px', fontWeight: 'bold', color: '#0c4a6e' }}>
                        {proximoControl}
                    </div>
                </div>
            )}

            <div className="footer">
                <div className="signature-box">
                    {/* Espacio para firma */}
                    <div style={{ height: '40px' }}></div>
                    <div className="signature-line">Firma Propietario</div>
                </div>
                <div className="signature-box">
                    {/* Espacio para firma/timbre */}
                    <div style={{ height: '40px' }}></div>
                    <div className="signature-line">
                        {veterinario?.nombre || 'Dra. Pilar Zoccola Segovia'}<br />
                        Médico Veterinario
                    </div>
                </div>
            </div>
        </div>
    );
};
