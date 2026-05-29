import type { ReactNode } from "react";
import type { InvoiceDocumentData } from "@/lib/invoice-data";

type OrderInvoiceDocumentProps = {
  data: InvoiceDocumentData;
};

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "paid" | "pending" | "failed" | "neutral";
}) {
  return (
    <span className={`invoice-status invoice-status--${tone}`}>{label}</span>
  );
}

function MetaBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="invoice-meta-block">
      <h2 className="invoice-meta-block__title">{title}</h2>
      <div className="invoice-meta-block__body">{children}</div>
    </div>
  );
}

export function OrderInvoiceDocument({ data }: OrderInvoiceDocumentProps) {
  return (
    <article className="invoice-paper" aria-label={`Invoice ${data.invoiceNumber}`}>
      <header className="invoice-header">
        <div className="invoice-header__brand">
          <p className="invoice-wordmark-eyebrow">Tac Accessories</p>
          <h1 className="invoice-wordmark">{data.store.name}</h1>
          {data.store.tagline ? (
            <p className="invoice-tagline">{data.store.tagline}</p>
          ) : null}
          <address className="invoice-store-contact not-italic">
            {data.store.address ? <span>{data.store.address}</span> : null}
            <span>{data.store.email}</span>
            <span>{data.store.phone}</span>
          </address>
        </div>

        <div className="invoice-header__meta">
          <p className="invoice-title">Invoice</p>
          <dl className="invoice-meta-list">
            <div className="invoice-meta-list__row">
              <dt>Invoice #</dt>
              <dd>{data.invoiceNumber}</dd>
            </div>
            <div className="invoice-meta-list__row">
              <dt>Date</dt>
              <dd>{data.issueDate}</dd>
            </div>
            <div className="invoice-meta-list__row">
              <dt>Currency</dt>
              <dd>{data.currency}</dd>
            </div>
            <div className="invoice-meta-list__row">
              <dt>Status</dt>
              <dd>
                <StatusBadge
                  label={data.paymentStatusLabel}
                  tone={data.paymentStatusTone}
                />
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <section className="invoice-meta-grid" aria-label="Invoice parties">
        <MetaBlock title="Bill To">
          <p className="invoice-party-name">{data.billTo.name}</p>
          {data.billTo.email ? (
            <p className="invoice-party-detail">{data.billTo.email}</p>
          ) : null}
          {data.billTo.phone ? (
            <p className="invoice-party-detail">{data.billTo.phone}</p>
          ) : null}
        </MetaBlock>

        <MetaBlock title="Ship To">
          {data.shipTo.lines.map((line) => (
            <p key={line} className="invoice-party-detail">
              {line}
            </p>
          ))}
        </MetaBlock>

        <MetaBlock title="Payment">
          <dl className="invoice-payment-list">
            <div className="invoice-payment-list__row">
              <dt>Method</dt>
              <dd>{data.payment.methodLabel}</dd>
            </div>
            <div className="invoice-payment-list__row">
              <dt>Status</dt>
              <dd>
                <StatusBadge
                  label={data.payment.statusLabel}
                  tone={data.payment.statusTone}
                />
              </dd>
            </div>
            {data.payment.receiptNumber ? (
              <div className="invoice-payment-list__row">
                <dt>M-Pesa receipt</dt>
                <dd>{data.payment.receiptNumber}</dd>
              </div>
            ) : null}
            {data.payment.transactionId ? (
              <div className="invoice-payment-list__row">
                <dt>Reference</dt>
                <dd className="invoice-payment-ref">{data.payment.transactionId}</dd>
              </div>
            ) : null}
          </dl>
        </MetaBlock>
      </section>

      <section className="invoice-lines" aria-label="Line items">
        <table className="invoice-table">
          <thead>
            <tr>
              <th scope="col" className="invoice-table__col-num">
                #
              </th>
              <th scope="col">Description</th>
              <th scope="col" className="invoice-table__col-sku">
                SKU
              </th>
              <th scope="col" className="invoice-table__col-qty">
                Qty
              </th>
              <th scope="col" className="invoice-table__col-money">
                Unit price
              </th>
              <th scope="col" className="invoice-table__col-money">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {data.lineItems.map((item) => (
              <tr key={item.index}>
                <td className="invoice-table__col-num">{item.index}</td>
                <td className="invoice-table__desc">{item.description}</td>
                <td className="invoice-table__col-sku">{item.sku}</td>
                <td className="invoice-table__col-qty">{item.quantity}</td>
                <td className="invoice-table__col-money">{item.unitPrice}</td>
                <td className="invoice-table__col-money invoice-table__amount">
                  {item.lineTotal}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="invoice-totals" aria-label="Invoice totals">
        <dl className="invoice-totals__list">
          <div className="invoice-totals__row">
            <dt>Subtotal</dt>
            <dd>{data.totals.subtotal}</dd>
          </div>
          <div className="invoice-totals__row">
            <dt>Shipping</dt>
            <dd>{data.totals.shipping}</dd>
          </div>
          <div className="invoice-totals__row">
            <dt>Tax</dt>
            <dd>{data.totals.tax}</dd>
          </div>
          <div className="invoice-totals__row invoice-totals__row--total">
            <dt>Total</dt>
            <dd>{data.totals.total}</dd>
          </div>
        </dl>
      </section>

      <footer className="invoice-footer">
        <p>
          Thank you for shopping with {data.store.name}. For questions about this
          invoice, contact us at{" "}
          <a href={`mailto:${data.store.email}`}>{data.store.email}</a> or{" "}
          {data.store.phone}.
        </p>
        <p className="invoice-footer__website">
          <a href={data.store.website}>{data.store.website.replace(/^https?:\/\//, "")}</a>
        </p>
      </footer>
    </article>
  );
}
