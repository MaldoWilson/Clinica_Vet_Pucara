import React from 'react';

// Estilos compartidos para asegurar consistencia exacta
export const RECETA_STYLES = `
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

  .receta-container {
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
    .receta-container {
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

  .med-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 12px;
  }

  .med-table th {
    background: #2563eb;
    color: white;
    padding: 10px;
    text-align: left;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 11px;
  }

  .med-table td {
    border-bottom: 1px solid #e2e8f0;
    padding: 10px;
    vertical-align: top;
  }

  .med-table tr:nth-child(even) {
    background-color: #f8fafc;
  }

  .notes-section {
    margin-top: 20px;
    padding: 15px;
    background: #fffbeb;
    border: 1px solid #fcd34d;
    border-radius: 8px;
    font-size: 13px;
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

export const RecetaTemplate = ({ receta, mascota, veterinario, isPreview = false }: any) => {
    const fecha = receta.fecha ? new Date(receta.fecha) : new Date();
    const fechaStr = fecha.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className={`receta-container ${isPreview ? 'preview-mode' : ''}`}>
            <div className="header">
                <div className="clinic-info">
                    <h1>Clínica Veterinaria Pucará</h1>
                    <p>Esmeralda N° 97, San Bernardo</p>
                    <p>Fono: 22859 2840 / Whatsapp: +56 9 39246250</p>
                    <p>Email: contacto@veterinariapucara.cl</p>
                </div>
                <div className="vet-info">
                    <div className="vet-name">Dra. Pilar Zoccola Segovia</div>
                    <div>Médico Veterinario</div>
                    <div>R.U.T: 10.301.357-7</div>
                    <div style={{ marginTop: '10px' }}>
                        <span className="date-badge">{fechaStr}</span>
                    </div>
                </div>
            </div>

            <div className="doc-title">Receta Médica #{receta.id}</div>

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
                        <span className="label">Peso:</span>
                        <span className="value">{receta.peso ? `${receta.peso} kg` : '-'}</span>
                    </div>
                    <div className="info-row" style={{ gridColumn: '1 / -1' }}>
                        <span className="label">Propietario:</span>
                        <span className="value">{mascota?.propietario?.nombre} {mascota?.propietario?.apellido}</span>
                    </div>
                </div>
            </div>

            <table className="med-table">
                <thead>
                    <tr>
                        <th>Medicamento</th>
                        <th>Dosis</th>
                        <th>Vía</th>
                        <th>Frecuencia</th>
                        <th>Duración</th>
                        <th>Instrucciones</th>
                    </tr>
                </thead>
                <tbody>
                    {receta.items?.map((item: any, i: number) => (
                        <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{item.nombre_medicamento}</td>
                            <td>{item.dosis}</td>
                            <td>{item.via}</td>
                            <td>{item.frecuencia}</td>
                            <td>{item.duracion}</td>
                            <td style={{ fontStyle: 'italic' }}>{item.instrucciones}</td>
                        </tr>
                    ))}
                    {(!receta.items || receta.items.length === 0) && (
                        <tr>
                            <td colSpan={6} style={{ textAlign: 'center', color: '#6b7280' }}>No hay medicamentos registrados</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {receta.notas && (
                <div className="notes-section">
                    <div className="label" style={{ marginBottom: '5px' }}>Observaciones:</div>
                    <div className="value" style={{ whiteSpace: 'pre-wrap' }}>{receta.notas}</div>
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
                        Dra. Pilar Zoccola Segovia<br />
                        Médico Veterinario
                    </div>
                </div>
            </div>
        </div>
    );
};
