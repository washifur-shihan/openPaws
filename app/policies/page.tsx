export const metadata = { title: "Delivery & Return Policy | OpenPaws" };

export default function PoliciesPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-5xl font-black text-cocoa">Delivery & return policy</h1>
      <div className="mt-8 grid gap-4">
        <div className="card p-6">
          <h2 className="text-2xl font-black text-cocoa">Delivery</h2>
          <p className="mt-3 leading-7 text-cocoa/65">Orders are confirmed by phone or WhatsApp before dispatch.</p>
        </div>
        <div className="card p-6">
          <h2 className="text-2xl font-black text-cocoa">Return</h2>
          <p className="mt-3 leading-7 text-cocoa/65">Items can be returned within your chosen return window. For hygiene and pet safety, used toys should not be resold.</p>
        </div>
        <div className="card p-6">
          <h2 className="text-2xl font-black text-cocoa">Support</h2>
          <p className="mt-3 leading-7 text-cocoa/65">Customers can contact you through WhatsApp, email, or the AI chat widget for product suggestions and order help.</p>
        </div>
      </div>
    </section>
  );
}
