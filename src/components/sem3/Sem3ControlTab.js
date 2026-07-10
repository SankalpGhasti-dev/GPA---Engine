import React from "react";

export default function Sem3ControlTab({ controlIdx, subjects, getComponents, getMaxMarks }) {
  return (
    <div className="control-section">
      <div className="control-hero">
        <div className="ch-val">{controlIdx.controlled}%</div>
        <div className="ch-label">of your SGPA is in your hands</div>
      </div>
      <div className="ci-bar big">
        <div className="ci-seg ci-controlled" style={{ width: `${controlIdx.controlled}%` }} />
        <div className="ci-seg ci-partial" style={{ width: `${controlIdx.partial}%` }} />
        <div className="ci-seg ci-exam" style={{ width: `${controlIdx.exam}%` }} />
      </div>
      <div className="ci-legend-full">
        <div className="clf-item"><span className="ci-dot controlled" />Student Controlled (CA1, CA2, Lab practicals): {controlIdx.controlled}%</div>
        <div className="clf-item"><span className="ci-dot partial" />Partially Controlled (Viva): {controlIdx.partial}%</div>
        <div className="clf-item"><span className="ci-dot exam" />Exam Only (ESE): {controlIdx.exam}%</div>
      </div>
      <div className="control-subject-list">
        {subjects.map(s => {
          const comps = getComponents(s.type);
          const controlled = comps.filter(c => c.key === "ca1" || c.key === "ca2" || c.key === "practical").reduce((x, c) => x + c.max, 0);
          const partial = comps.filter(c => c.key === "viva").reduce((x, c) => x + c.max, 0);
          const exam = comps.filter(c => c.key === "ese").reduce((x, c) => x + c.max, 0);
          const total = getMaxMarks(s.type);
          return (
            <div key={s.code} className="cs-row">
              <span className="cs-name">{s.displayName || s.name}</span>
              <span className="pill credit">{s.credits} cr</span>
              <div className="cs-bar">
                <div className="ci-seg ci-controlled" style={{ width: `${(controlled / total) * 100}%` }} title={`Controlled: ${controlled}/${total}`} />
                <div className="ci-seg ci-partial" style={{ width: `${(partial / total) * 100}%` }} title={`Partial: ${partial}/${total}`} />
                <div className="ci-seg ci-exam" style={{ width: `${(exam / total) * 100}%` }} title={`Exam: ${exam}/${total}`} />
              </div>
              <span className="cs-pct">{Math.round((controlled / total) * 100)}% controlled</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
