// TODO: questo è copiato incollato da app, dovremmo metterlo in un unico posto
export function toEnglishString(n: number): string {
  let prefix = ''
  if (n < 0) {
    prefix = 'minus '
    n = -n
  }
  const singleDigit = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  const doubleDigit = [
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen'
  ]
  const belowHundred = [
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety'
  ]
  if (n === 0) return 'Zero'
  function translate(n: number): string {
    let word = ''
    if (n < 10) {
      word = (singleDigit[n] as string) + ' '
    } else if (n < 20) {
      word = (doubleDigit[n - 10] as string) + ' '
    } else if (n < 100) {
      const rem = translate(n % 10)
      word = (belowHundred[(n - (n % 10)) / 10 - 2] as string) + ' ' + rem
    } else if (n < 1000) {
      word = (singleDigit[Math.trunc(n / 100)] as string) + ' Hundred ' + translate(n % 100)
    } else if (n < 1000000) {
      word = translate(Math.floor(n / 1000)).trim() + ' Thousand ' + translate(n % 1000)
    } else if (n < 1000000000) {
      word = translate(Math.floor(n / 1000000)).trim() + ' Million ' + translate(n % 1000000)
    } else {
      word = translate(Math.floor(n / 1000000000)).trim() + ' Billion ' + translate(n % 1000000000)
    }
    return word
  }
  const result = translate(n)
  return prefix + result.trim()
}
