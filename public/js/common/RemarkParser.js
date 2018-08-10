export default class RemarkParser {
    static parse(remark) {
        const match = remark.match(/booked a class id = (\d+)/)

        if (match) {
            return remark.replace(match[0], `被排进编号为 <a href="/classes/${match[1]}" target="_blank">${match[1]}</a> 的班级`)
        }

        return remark
    }
}
