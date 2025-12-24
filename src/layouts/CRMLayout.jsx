export default function CRMLayout({ children }) {
  return (
    <div className="pt-28 px-4"> {/* espace sous le header fixe */}
      <div className="max-w-6xl mx-auto space-y-6">{children}</div>
    </div>
  );
}
