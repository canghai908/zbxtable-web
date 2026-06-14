import FileSaver from 'file-saver'

let xlsxPromise

function loadXlsx() {
  if (!xlsxPromise) {
    xlsxPromise = import(/* webpackChunkName: "vendor-xlsx" */ 'xlsx/dist/xlsx.mini.min.js')
      .then((module) => module.default || module)
  }
  return xlsxPromise
}

export async function exportTableToXlsx(table, filename) {
  if (!table) {
    return null
  }

  const XLSX = await loadXlsx()
  const workbook = XLSX.utils.table_to_book(table)
  const output = XLSX.write(workbook, {
    bookType: 'xlsx',
    bookSST: true,
    type: 'array'
  })

  FileSaver.saveAs(
    new Blob([output], {
      type: 'application/octet-stream'
    }),
    filename
  )

  return output
}
