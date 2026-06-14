export function toPercentRows(rows, field = 'count', as = 'percent') {
  const total = rows.reduce((sum, row) => sum + Number(row[field] || 0), 0)
  return rows.map((row) => ({
    ...row,
    [as]: total ? Number(row[field] || 0) / total : 0
  }))
}

export function foldRows(rows, fields, key = 'key', value = 'value') {
  return rows.reduce((result, row) => {
    fields.forEach((field) => {
      result.push({
        ...row,
        [key]: field,
        [value]: row[field]
      })
    })
    return result
  }, [])
}
