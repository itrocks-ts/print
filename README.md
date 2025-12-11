[![npm version](https://img.shields.io/npm/v/@itrocks/print?logo=npm)](https://www.npmjs.org/package/@itrocks/print)
[![npm downloads](https://img.shields.io/npm/dm/@itrocks/print)](https://www.npmjs.org/package/@itrocks/print)
[![GitHub](https://img.shields.io/github/last-commit/itrocks-ts/print?color=2dba4e&label=commit&logo=github)](https://github.com/itrocks-ts/print)
[![issues](https://img.shields.io/github/issues/itrocks-ts/print)](https://github.com/itrocks-ts/print/issues)
[![discord](https://img.shields.io/discord/1314141024020467782?color=7289da&label=discord&logo=discord&logoColor=white)](https://25.re/ditr)

# print

Generic action-based PDF representation of object.

*This documentation was written by an artificial intelligence and may contain errors or approximations.
It has not yet been fully reviewed by a human. If anything seems unclear or incomplete,
please feel free to contact the author of this package.*

## Installation

```bash
npm i @itrocks/print
```

## Usage

`@itrocks/print` provides a simple action that can be used as a starting
point for generating PDF documents from your backend.

The main export is the `Print<T>` action which:

- is decorated with `@Need('object')` so it expects a domain object to be
  loaded for the current request,
- is decorated with `@Route('/print')` when used with
  [@itrocks/route](https://github.com/itrocks-ts/route),
- extends the generic
  [`Action<T>`](https://github.com/itrocks-ts/action#class-actiont-extends-object--object)
  base class from `@itrocks/action`,
- exposes a single method `pdf()` that generates a `PdfResponse`.

In the reference implementation the PDF content itself is intentionally
minimal (a single page with a sample text). You are expected to adapt or
extend the action for your own project to render whatever representation of
your objects you need.

### Minimal example

```ts
import { Print } from '@itrocks/print'
import type { Request } from '@itrocks/action-request'

class Invoice {
	number   = ''
	customer = ''
}

// Simple instance of the generic Print action
const printInvoice = new Print<Invoice>()

// Route handler that returns a PDF response
async function invoicePdf (request: Request<Invoice>) {
	// In a typical it.rocks stack, `request` is built for you by
	// @itrocks/action-request from the HTTP layer
	return printInvoice.pdf(request)
}
```

The `Request<Invoice>` type is usually constructed by
[@itrocks/action-request](https://github.com/itrocks-ts/action-request)
from an incoming HTTP request (Fastify, Express, …).

### Example with Fastify and @itrocks/route

When you use `@itrocks/print` together with
[@itrocks/route](https://github.com/itrocks-ts/route), the
`@Route('/print')` decorator and the `config.yaml` of this package can be
used to wire a conventional `/print` endpoint.

```ts
import fastify from 'fastify'
import { toActionRequest } from '@itrocks/action-request-fastify'
import { Print } from '@itrocks/print'
import type { Request } from '@itrocks/action-request'

class Invoice {
	id       = 0
	number   = ''
	customer = ''
}

const app          = fastify()
const printInvoice = new Print<Invoice>()

app.get('/invoices/:id/print', async (req, reply) => {
	const request: Request<Invoice> = toActionRequest<Invoice>(req)
	const response = await printInvoice.pdf(request)

	reply
		.status(response.status)
		.headers(response.headers)
		.type('application/pdf')
		.send(response.body)
})

app.listen({ port: 3000 })
```

This keeps your HTTP layer thin while delegating the PDF generation logic
to the action itself.

## API

### `class Print<T extends object = object> extends Action<T>`

`Print<T>` is a generic action designed to generate a PDF representation for
an object of type `T`.

From the implementation you can see that it is decorated with:

- `@Need('object')` – the action expects the current `Request<T>` to be
  able to resolve an object instance (typically via `getObject()` from the
  base `Action<T>` class).
- `@Route('/print')` – declares a conventional `/print` route when used
  with [@itrocks/route](https://github.com/itrocks-ts/route).

Type parameter:

- `T` – the domain object type for which you want to generate a PDF (for
  example `Invoice`, `Order`, `User`, …).

#### Methods

##### `pdf(): Promise<PdfResponse>`

Builds a PDF document and returns it wrapped in a `PdfResponse` from
[@itrocks/core-responses](https://github.com/itrocks-ts/core-responses).

In the default implementation the PDF contains a single page with a sample
text. In your own projects you will usually:

- subclass `Print<T>` and override `pdf()` to build a document that uses
  the properties of your object, or
- copy the pattern and adapt it inside a custom action that extends
  `Action<T>` directly.

The returned `PdfResponse` exposes the usual properties used by
`@itrocks/core-responses` (`status`, `headers`, `body`…), so it can be
returned as‑is by your HTTP framework adapters.

## Typical use cases

- Provide a basic `/print` endpoint for a given entity (invoice, order,
  user profile, …) without wiring PDF generation manually in every route.
- Use `Print<T>` as a minimal tutorial or starting point for using
  `pdfkit` and `PdfResponse` within the it.rocks action ecosystem.
- Prototype PDF exports quickly, then replace the sample implementation of
  `pdf()` with richer layouts (multi‑page documents, tables, branding,
  etc.).
- Offer a conventional PDF export option alongside existing HTML/JSON
  actions in your domain‑specific action packs.
