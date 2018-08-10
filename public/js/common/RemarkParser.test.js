import RemarkParser from './RemarkParser'

test('解析备注', () => {
    expect(RemarkParser.parse('')).toBe('')
})

test('被排进一个班级', () => {
    expect(RemarkParser.parse('booked a class id = 243')).toBe('被排进编号为 <a href="/classes/243" target="_blank">243</a> 的班级')
    expect(RemarkParser.parse('xxx booked a class id = 243')).toBe('xxx 被排进编号为 <a href="/classes/243" target="_blank">243</a> 的班级')
})
