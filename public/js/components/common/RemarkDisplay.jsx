import React from 'react'
import RemarkParser from "../../common/RemarkParser";

export default ({remark}) =>
    <div>{RemarkParser.parse(remark)}</div>

