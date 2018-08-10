import React from 'react'
import RemarkParser from "../../common/RemarkParser";

export default ({remark}) =>
    <div dangerouslySetInnerHTML={{__html: RemarkParser.parse(remark)}}/>

