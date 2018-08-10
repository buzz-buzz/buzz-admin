export default class RemarkParser {
    static parse(remark) {
        let match = remark.match(/booked a class id = (\d+)/)

        if (match) {
            return remark.replace(match[0], `被排进编号为 <a href="/admin-neue/classDetail/${match[1]}" target="_blank">${match[1]}</a> 的班级`)
        }

        match = remark.match(/cancelled booking for class id = (\d+)/)

        if (match) {
            return remark.replace(match[0], `从编号为 <a href="/admin-neue/classDetail/${match[1]}" target="_blank">${match[1]}</a> 的班级中移出`)
        }

        return remark
    }
}
