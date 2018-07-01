export const Grades = {
  0: '幼儿园',
  1: '一年级',
  2: '二年级',
  3: '三年级',
  4: '四年级',
  5: '五年级',
  6: '六年级',
  7: '七年级',
  8: '八年级',
  9: '九年级',
  10: '十年级',
  11: '十一年级',
  12: '十二年级'
}

export default {
  list: Object.keys(Grades).map(number => ({ key: number, value: number, text: Grades[number] }))
}