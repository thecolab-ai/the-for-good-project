import { Outlet } from "react-router-dom";

// The centred, max-width reading column most pages use — split out from
// AppLayout's <main> so full-bleed pages (Streams, Findings, etc.) can render
// directly in the unconstrained <main> instead of fighting its width cap.
export function ContainedPage() {
  return (
    <div className="container py-8">
      <Outlet />
    </div>
  );
}
