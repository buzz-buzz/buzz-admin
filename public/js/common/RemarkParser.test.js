import RemarkParser from './RemarkParser'

test('解析备注', () => {
    expect(RemarkParser.parse('')).toBe('')
})
