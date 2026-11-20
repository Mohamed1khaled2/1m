/** ورقة من الدفتر، مايلة سنة وعليها حتة لزق، زي ما تكون متقطعة من بوكس الخطة. */
export function Paper({
  children,
  tilt = -0.6,
  className = "",
}: {
  children: React.ReactNode;
  tilt?: number;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`} style={{ transform: `rotate(${tilt}deg)` }}>
      <span className="paper-tape right-8 rotate-3" aria-hidden />
      <span className="paper-tape left-8 -rotate-2" aria-hidden />
      <div className="paper py-6">{children}</div>
    </div>
  );
}
