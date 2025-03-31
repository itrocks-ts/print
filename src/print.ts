import { Action }      from '@itrocks/action'
import { Need }        from '@itrocks/action'
import { PdfResponse } from '@itrocks/core-responses'
import { Route }       from '@itrocks/route'
import PDFDocument     from 'pdfkit'
import { PassThrough } from 'node:stream'

@Need('object')
@Route('/print')
export class Print<T extends object = object> extends Action<T>
{

	async pdf()
	{
		const document = new PDFDocument()
		const stream   = new PassThrough()
		const chunks   = <any>[]
		document.pipe(stream)
		stream.on('data', chunk => { chunks.push(chunk) })

		document.font('Times-Roman')
			.fontSize(25)
			.text('Bonjour, ô seigneur et maître !', 100, 100)
		document.end()

		await new Promise(resolve => stream.on('end', resolve))
		return new PdfResponse(Buffer.concat(chunks))
	}

}
