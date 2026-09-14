import { TriangleAlert, CircleCheck } from "lucide-react";

export function Sheet({ title, sub, children, right }) {
  return (
    <div className="sheet">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          {title && <p className="sheet-title">{title}</p>}
          {sub && <p className="sheet-sub">{sub}</p>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

export function StatusPill({ status }) {
  return <span className={`pill status-${status}`}>{status}</span>;
}

export function DecisionPill({ gap }) {
  if (gap === null || gap === undefined || !isFinite(gap)) return <span className="pill ok">—</span>;
  if (gap > 0.3) return <span className="pill bad"><TriangleAlert size={12} />Contratar/Terceirizar</span>;
  if (gap > 0) return <span className="pill warn"><TriangleAlert size={12} />Atenção</span>;
  return <span className="pill ok"><CircleCheck size={12} />OK</span>;
}
