import * as React from "react";
import {
    Button,
    Container,
    Dropdown,
    Form,
    Menu,
    Segment,
    Table,
    Message,
    Header, Image, Modal, Icon
} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";
import ClassDetail from "./class-detail-modal";
import ClassEvaluation from "./class-evaluation-modal";
import {ClassStatusCode} from "../../common/ClassStatus";
import * as _ from "lodash";
import {BuzzPaginationData} from "../common/BuzzPagination";
import BuzzPagination from "../common/BuzzPagination";
import {Avatar} from "../../common/Avatar";
import CurrentUser from "../../common/CurrentUser";
import moment from 'moment';
import DatePicker from 'react-datepicker';
import TimeDisplay from '../common/time-display';
import ClassRoomDisplay from "./ClassRoomDisplay";

function nearestToper(x, y) {
    let now = new Date();
    let startOfX = new Date(x.start_time);
    let startOfY = new Date(y.start_time);

    let diffOfX = Math.abs(now - startOfX);
    let diffOfY = Math.abs(now - startOfY);

    if (diffOfX < diffOfY) {
        return -1;
    }

    if (diffOfX > diffOfY) {
        return 1;
    }

    return 0;
}

export default class ClassList extends React.Component {
    handleStatusChange = (event, {value}) => {
        let {searchParams} = this.state;
        searchParams.statuses = value;

        this.setState({
            searchParams,
        })
    };

    handleUsersChange = (event, {value}) => {
        this.setState({
            searchParams: {
                ...this.state.searchParams,
                user_ids: value
            }
        })
    };

    handleConfirmStateChange = async (event, {value, classInfo}) => {
        try{
            await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/class-schedule/updatedCompanionScheduleConfirmState`,
                    json: {
                        class_id: classInfo.class_id,
                        user_id: classInfo.companions[0],
                        confirm_state: value,
                    },
                    method: 'POST'
                }
            });

            let classes = Object.assign(this.state.classes, []);

            for(let i in classes){
                if(classes[i].class_id === classInfo.class_id){
                    classes[i].confirm_state = value;
                    break;
                }
            }

            this.setState({
                classes: classes
            });
        }
        catch (ex) {

        }
    };

    fetchAllUsers = async () => {
        if (!this.state.allUsersLoaded) {
            await this.getAllUsers()
        }
    };

    constructor() {
        super();

        let query = new URLSearchParams(window.location.search);
        let statuses = query.getAll('statuses').length ? query.getAll('statuses') : [ClassStatusCode.Opened];
        this.state = {
            classes: [],
            loading: false,
            searchParams: {
                start_time: query.get('start_time') || moment().subtract(30, 'days'),
                end_time: '',
                statuses: statuses,
                user_ids: query.getAll('userIds').map(id => Number(id)),
                orderby: 'diff ASC',
                need_export_recording: false
            },
            currentStatuses: statuses,
            column: null,
            direction: null,
            pagination: BuzzPaginationData,
            allStatuses: Object.keys(ClassStatusCode).map(key => ({
                key: ClassStatusCode[key],
                value: ClassStatusCode[key],
                text: ClassStatusCode[key]
            })),
            currentUser: {},
            allSales: [],
            ExportRecordingModal: false
        };

        this.openClassDetail = this.openClassDetail.bind(this);
        this.onClassDetailClosed = this.onClassDetailClosed.bind(this);
        this.onClassSaved = this.onClassSaved.bind(this);
        this.openClassDetail = this.openClassDetail.bind(this);
        this.openAdminNeueClassDetail = this.openAdminNeueClassDetail.bind(this);

        this.handleChange = this.handleChange.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.searchClasses = this.searchClasses.bind(this);
        this.updateStatus = this.updateStatus.bind(this);
        this.exportRecording = this.exportRecording.bind(this);
        this.openFeedback = this.openFeedback.bind(this);
        this.onClassEvaluationClosed = this.onClassEvaluationClosed.bind(this);

        this.switchToStatus = this.switchToStatus.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.gotoPage = this.gotoPage.bind(this);
        this.renderExportRecording = this.renderExportRecording.bind(this);
        this.close = this.close.bind(this);
        this.copy = this.copy.bind(this);
        this.deleteZoom = this.deleteZoom.bind(this);
        this.getAllEndedClasses = this.getAllEndedClasses.bind(this);
    }

    async updateStatus() {
        this.setState({loading: true});
        try {
            await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/class-schedule`,
                    method: 'PUT'
                }
            });

            this.setState({error: false});
            this.setState({error: false});
            await this.searchClasses();
        } catch (error) {
            this.setState({
                error: true,
                message: JSON.stringify(error.result || error.message || error)
            })
        } finally {
            this.setState({loading: false})
        }
    }

    onExportAll = async () => {
        this.setState({
            downloadLink: `data:text/csv;charset=utf-8,\ufeff${await this.getAllEndedClasses()}`,
            filename: 'allEndedClasses.csv'
        })
    };

    async exportRecording(){
        //console.log() 此处弹窗 ExportRecordingModal
        try{
            this.setState({loading: true});

            let classIds = [];

            this.state.classes.map((item)=>{
            classIds.push(item.class_id);
            });

            if(classIds.length){
                //api
                let recordingResult = await ServiceProxy.proxyTo({
                    body: {
                        uri: '{buzzApi}/class/getRecodingsByClassId',
                        method: 'POST',
                        json: {
                            class_ids: classIds
                        }
                    }
                })

                this.setState({
                    ExportRecordingModal: true,
                    windowsCopy: recordingResult.cmd && recordingResult.cmd.win ? recordingResult.cmd.win : '',
                    macCopy: recordingResult.cmd && recordingResult.cmd.macOS ? recordingResult.cmd.macOS : '',
                    loading: false
                });

                console.log('hank----log:');
                console.log(recordingResult);
            }else{
                alert('未选择有效班级');
            }
        }
        catch(ex){
            this.setState({
                loading: false
            }, ()=>{
                alert('发生错误：' + ex);
            });
        }
    }

    close(){
        this.setState({
            ExportRecordingModal: false,
            loading: false
        });
    }

    handleChange(event, {name, value}) {
        let clonedSearchParams = this.state.searchParams;
        clonedSearchParams[name] = value;

        this.setState({
            searchParams: clonedSearchParams
        })
    }

    handleDateChange(attr, date) {
        this.setState({
            searchParams: {
                ...this.state.searchParams,
                [attr]: date || ''
            }
        })
    }

    switchToStatus(status) {
        this.setState({
            classes: this.state.classes,
            currentStatuses: [status],
            direction: null,
            column: null
        })
    }

    async searchClasses() {
        this.setState({loading: true})
        try {
            console.log('pagination = ', this.state.pagination);
            let paginationData = await ServiceProxy.proxyTo({
                body: {
                    uri: '{buzzService}/api/v1/class-schedule',
                    method: 'GET',
                    qs: Object.assign({}, this.state.searchParams, {
                        start_time: this.state.searchParams.start_time ? new Date(this.state.searchParams.start_time) : undefined,
                        end_time: this.state.searchParams.end_time ? new Date(this.state.searchParams.end_time) : undefined,
                        statuses: this.state.searchParams.statuses.length ? this.state.searchParams.statuses : undefined
                    }, this.state.pagination),
                    useQuerystring: true
                }
            })

            let result = paginationData.data;

            this.setState({
                loading: false,
                pagination: {
                    current_page: paginationData.current_page,
                    from: paginationData.from,
                    last_page: paginationData.last_page,
                    offset: paginationData.offset,
                    per_page: paginationData.per_page,
                    to: paginationData.to,
                    total: paginationData.total
                },
                classes: result.map(c => {
                    let uniqueFilter = (value, index, self) => self.indexOf(value) === index;
                    c.companions = (c.companions || '').split(',').filter(uniqueFilter);
                    c.students = (c.students || '').split(',').filter(uniqueFilter);
                    c.student_avatar = (c.student_avatar || '').split(',').filter(uniqueFilter);
                    c.student_name = (c.student_name || '').split(',').filter(uniqueFilter);
                    c.subscribers = (c.subscribers || '').split(',').filter(uniqueFilter);
                    return c;
                }).filter(i=>{ return i.start_time && i.students}),
                currentStatuses: this.state.searchParams.statuses,
                error: false,
                recordingExport: this.state.searchParams.need_export_recording
            })
        } catch (ex) {
            this.setState({
                error: true,
                message: ex.message || JSON.stringify(ex)
            })
        } finally {
            this.setState({loading: false})
        }
    }

    async getAllEndedClasses() {
        try {
            const columnNames = {
                class_id: '课程ID',
                allow_sign_up: '允许报名',
                class_hours: '占用课时数',
                companion_name: 'Tutor昵称',
                companions: 'Tutor编号',
                students: 'Student编号',
                confirm_state: 'Tutor签到状态',
                start_time: '开始时间',
                end_time: '结束时间',
                module: '模块',
                status: '状态',
                topic: '课程主题',
                class_hours: '课时数',
                zoom_meeting_id: '会议ID'
            }
            
            //this.state.classes
            // let allClasses = (await ServiceProxy.proxyTo({
            //     body: {
            //         uri: '{buzzService}/api/v1/class-schedule',
            //         method: 'GET',
            //         qs: Object.assign({}, {
            //             statuses: 'ended'
            //         }),
            //         useQuerystring: true
            //     }
            // })).filter(item =>{return item.start_time && item.students})

            let headers = Object.keys(this.state.classes[0]).filter(key => ['wechat_data', 'events', 'password', 'placement_test'].indexOf(key) < 0 && columnNames[key]);

            let result = [];
            result.push(headers.map(h => columnNames[h] || h).join(','))

            this.state.classes.forEach(u => {
                let line = []
                headers.forEach(key => {
                    let value = u[key];
                    if (key === 'mobile_country') {
                        value = u[key].country.country_full_name
                    }
                    line.push(encodeURIComponent(String(value).replace(/,/g, '|').replace(/[\r?\n]/g, '<br />')));
                    })

                result.push(line.join(','));
            })

            return result.join('\n');

        } catch (ex) {
            this.setState({
                error: true,
                message: ex.message || JSON.stringify(ex)
            })
        } finally {
            this.setState({loading: false})
        }
    }

    async getAllUsers() {
        this.setState({fetchingAllUsers: true})
        let result = await ServiceProxy.proxyTo({
            body: {uri: `{buzzService}/api/v1/users`}
        });
        this.setState({
            fetchingAllUsers: false, allSales: result.map(u => ({
                key: u.user_id,
                value: u.user_id,
                text: u.name || u.wechat_name,
                // description: u.display_name,
                image: {avatar: true, src: u.avatar}
            }))
        }, () => {
            this.setState({
                searchParams: {
                    ...this.state.searchParams,
                    user_ids: new URLSearchParams(window.location.search).getAll('userIds').map(id => Number(id))
                },
                allUsersLoaded: true
            })
        });
    }

    async componentWillMount() {
        await this.searchClasses();
        this.setState({
            currentUser: await CurrentUser.getInstance()
        })
    }

    openClassDetail(c) {
        this.setState({
            detailOpen: true,
            currentClass: c,
            buttonDisabled: !c,
        })
    }

    onClassDetailClosed() {
        this.setState({detailOpen: false})
    }

    onClassSaved(savedClass) {
        let classes = Object.assign([], this.state.classes);
        if (classes.map(c => c.class_id).indexOf(savedClass.class_id) < 0) {
            classes.unshift(savedClass);
        } else {
            classes = classes.map(c => {
                if (c.class_id === savedClass.class_id) {
                    return savedClass;
                }

                return c;
            })
        }

        this.setState({classes: classes, currentClass: savedClass});
    }

    openFeedback(c) {
        this.setState({
            evaluationOpen: true,
            currentClass: c,
        })
    }

    onClassEvaluationClosed() {
        this.setState({evaluationOpen: false})
    }

    render() {
        return (
            <Container fluid>
                {this.renderSearchForm()}
                {this.renderClassStatuses()}
                {/*{this.renderPagination()}*/}
                {this.renderTable()}
                {this.renderPagination()}
                {
                    (process.env.NODE_NEV !== 'production') &&

                    <ClassDetail open={this.state.detailOpen}
                                 onClose={this.onClassDetailClosed}
                                 onClassSaved={this.onClassSaved}
                                 class={this.state.currentClass}
                                 buttonDisabled={this.state.buttonDisabled}/>
                }


                <ClassEvaluation open={this.state.evaluationOpen}
                                 onClose={this.onClassEvaluationClosed}
                                 evaluation={this.state.currentClass}
                                 classInfo={this.state.currentClass}/>
                {this.renderExportRecording()}
            </Container>
        );
    }

    renderTable() {
        return <Table celled sortable selectable striped>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell
                        sorted={this.state.column === 'class_id' ? this.state.direction : null}
                        onClick={() => this.handleSort('class_id')}>课程ID</Table.HeaderCell>
                    <Table.HeaderCell
                        sorted={this.state.column === 'topic' ? this.state.direction : null}
                        onClick={() => this.handleSort('topic')}>课程内容</Table.HeaderCell>
                    <Table.HeaderCell
                        sorted={this.state.column === 'class_hours' ? this.state.direction : null}
                        onClick={() => this.handleSort('class_hours')}>课时数</Table.HeaderCell>
                    <Table.HeaderCell
                        sorted={this.state.column === 'start_time' ? this.state.direction : null}
                        onClick={() => this.handleSort('start_time')}>课程开始时间</Table.HeaderCell>
                    <Table.HeaderCell
                        sorted={this.state.column === 'room_url' ? this.state.direction : null}
                        onClick={() => this.handleSort('room_url')}>教室（链接）</Table.HeaderCell>
                    <Table.HeaderCell
                        sorted={this.state.column === 'companions' ? this.state.direction : null}
                        onClick={() => this.handleSort('companions')}>教学方</Table.HeaderCell>
                    <Table.HeaderCell
                        sorted={this.state.column === 'students' ? this.state.direction : null}
                        onClick={() => this.handleSort('students')}>学习方</Table.HeaderCell>
                    <Table.HeaderCell
                        sorted={this.state.column === 'subscribers' ? this.state.direction : null}
                        onClick={() => this.handleSort('subscribers')}>运营人员</Table.HeaderCell>
                    <Table.HeaderCell>操作</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {
                    this.state.classes.filter(c => this.state.currentStatuses.length === 0 || this.state.currentStatuses.indexOf(c.status) >= 0).map((c) =>
                        <Table.Row key={c.class_id} style={{cursor: 'pointer'}}
                                   onClick={() => process.env.NODE_ENV !== 'production' ? this.openClassDetail(c) : this.openAdminNeueClassDetail(c)}>
                            <Table.Cell>
                                {c.class_id}
                            </Table.Cell>
                            <Table.Cell>
                                <strong>{c.module}</strong><br/>
                                <span style={{color: 'gainsboro'}}>{c.topic_level}</span><br/>
                                <span>{c.topic}</span>
                            </Table.Cell>
                            <Table.Cell>
                                {c.class_hours}
                            </Table.Cell>
                            <Table.Cell>
                                <TimeDisplay timestamp={c.start_time}/>
                                <br/>
                                <span style={{color: 'red',fontSize: '16px', fontWeight: '600'}}>{moment(c.start_time).format('LT')}</span><br/>
                            </Table.Cell>
                            <Table.Cell style={{
                                whiteSpace: 'normal',
                                wordWrap: 'break-word'
                            }}>
                                <ClassRoomDisplay roomUrl={c.room_url} MeetingId={c.zoom_meeting_id} />
                            </Table.Cell>
                            <Table.Cell>
                                {
                                    this.state.currentStatuses.indexOf('opened') >= 0 ?
                                    <p>
                                    <Form.Field control={Dropdown} label="Tutor签到状态" name="confirm_state"
                                        value={c.confirm_state}
                                        classInfo={c}
                                        onChange={this.handleConfirmStateChange}
                                        options={[{
                                            key: '1',
                                            value: 'confirmed',
                                            text: '已确认'
                                        }, {
                                            key: '2',
                                            value: 'cancelled',
                                            text: '已取消'
                                        }, {
                                            key: '3',
                                            value: null,
                                            text: '空(未确认)'
                                        }]} selection/>
                                    </p> : ''

                                }
                                {
                                    c.companions.map(userId => <a
                                        target="_blank"
                                        key={userId}>
                                        <Avatar profile={{name: c.companion_name, avatar: c.companion_avatar}}  link={true} userId={userId}/>
                                    </a>)
                                }
                            </Table.Cell>
                            <Table.Cell
                                onClick={(event) => event.stopPropagation()}>
                                {
                                    c && c.students && c.students.map((item, index) => <a
                                        target="_blank"
                                        key={index}>
                                        <Avatar profile={{name: c.student_name[index], avatar: c.student_avatar[index]}} link={true} userId={item}/>
                                    </a>)
                                }
                            </Table.Cell>
                            <Table.Cell
                                onClick={event => event.stopPropagation()}>
                                {
                                    c.subscribers.map(userId => <a
                                        target="_blank" key={userId}>
                                        <Avatar link={true} userId={userId}/>
                                    </a>)
                                }
                            </Table.Cell>
                            <Table.Cell onClick={(e) => {
                                e.stopPropagation();
                            }}>
                                <p>
                                    <a className="ui green button"
                                       target="_blank"
                                       href={`/admin-neue/classDetail/${c.class_id}`}
                                       style={{whiteSpace: 'nowrap'}}>编辑详情</a>
                                </p>
                                <p>
                                    <a className="ui green button"
                                       target="_blank"
                                       href={`/feedbacks/${c.class_id}`}
                                       style={{whiteSpace: 'nowrap'}}>
                                        查看评价
                                    </a>
                                </p>
                            </Table.Cell>
                        </Table.Row>
                    )
                }
            </Table.Body>
        </Table>;
    }

    renderClassStatuses() {
        return <Menu fluid widths={Object.keys(ClassStatusCode).length}>
            {
                Object.keys(ClassStatusCode).map(
                    key => (
                        <Menu.Item name={key}
                                   active={this.state.currentStatuses.indexOf(ClassStatusCode[key]) >= 0}
                                   onClick={() => this.searchClassesByStatus(ClassStatusCode[key])}
                                   key={key}/>
                    )
                )
            }
        </Menu>;
    }

    renderSearchForm() {
        return <Segment loading={this.state.loading}>
            <Form onSubmit={this.searchClasses} error={this.state.error}>
                <Message error>
                    <p>{this.state.message}</p>
                </Message>
                <Form.Group widths="equal">
                    <Form.Field>
                        <label>开班开始时间</label>
                        <DatePicker showTimeSelect
                                    selected={this.state.searchParams.start_time ? moment(this.state.searchParams.start_time) : null}
                                    name="start_time" isClearable={true}
                                    dateFormat={"YYYY-MM-DD HH:mm"}
                                    placeholderText={"开班开始时间"}
                                    onChange={date => this.handleDateChange('start_time', date)}/>
                    </Form.Field>
                    <Form.Field>
                        <label>开班结束时间</label>
                        <DatePicker showTimeSelect
                                    selected={this.state.searchParams.end_time ? moment(this.state.searchParams.end_time) : null}
                                    name="end_time"
                                    isClearable={true}
                                    dateFormat={"YYYY-MM-DD HH:mm"}
                                    placeholderText={"开班结束时间"}
                                    onChange={date => this.handleDateChange('end_time', date)}/>
                    </Form.Field>
                    <Form.Field control={Dropdown} label="状态" name="status"
                                value={this.state.searchParams.statuses}
                                onChange={this.handleStatusChange} multiple
                                search selection
                                options={this.state.allStatuses}/>
                    <Form.Field control={Dropdown} label="参与者" name="users"
                                value={this.state.searchParams.user_ids}
                                onChange={this.handleUsersChange}
                                onClick={this.fetchAllUsers}
                                multiple search selection
                                options={this.state.allSales}
                                loading={this.state.fetchingAllUsers}
                    />
                    <Form.Field control={Dropdown} label="排序方式" name="orderby"
                                value={this.state.searchParams.orderby}
                                onChange={this.handleChange}
                                options={[{
                                    key: 'diff ASC',
                                    value: 'diff ASC',
                                    text: '开课时间越近越靠前'
                                }, {
                                    key: 'start_time DESC',
                                    value: 'start_time DESC',
                                    text: '开课时间倒序'
                                }]} selection/>
                    <Form.Field control={Dropdown} label="导出录像" name="need_export_recording"
                                value={this.state.searchParams.need_export_recording}
                                onChange={this.handleChange}
                                options={[{
                                    key: 'on',
                                    value: true,
                                    text: '是'
                                }, {
                                    key: 'off',
                                    value: false,
                                    text: '否'
                                }]} selection/>
                </Form.Group>
            </Form>
            <Form.Group>
                <Button type="submit" onClick={this.searchClasses}>查询</Button>
                {
                    process.env.NODE_ENV !== 'production' &&
                    <Button onClick={() => this.openClassDetail()}
                            type="button">创建班级</Button>
                }
                <a className="ui button green"
                   href={`/admin-neue/classDetail/create`}
                   target="_blank">创建班级</a>
                {
                    this.state.currentUser.super &&
                    <Button onClick={this.updateStatus}
                            type="button">批量更新班级结束状态</Button>
                }
                <a href={this.state.downloadLink} className="ui button right floated"
                       download={this.state.filename} onClick={this.onExportAll}
                       style={{cursor: 'pointer'}}>
                        <Icon name="download"/>
                        导出班级信息(搜索结果-本页)
                </a>
                {
                    this.state.recordingExport &&
                    <Button onClick={this.exportRecording}
                            type="button">导出本页已结束课程录像</Button>
                }
            </Form.Group>
        </Segment>;
    }

    renderPagination() {
        return (
            <Table>
                <Table.Header>
                    <Table.Row>
                        <BuzzPagination pagination={this.state.pagination}
                                        gotoPage={this.gotoPage}
                                        paginationChanged={(newPagination) => {
                                            window.localStorage.setItem('pagination.per_page', newPagination.per_page);
                                            this.setState({pagination: newPagination}, async () => {
                                                await this.searchClasses();
                                            })
                                        }} colSpan={11}/>
                    </Table.Row>
                </Table.Header>
            </Table>
        )
    }

    renderExportRecording(){
        return (
            <Modal open={this.state.ExportRecordingModal} closeOnEscape={true} closeOnRootNodeClick={false} onClose={this.close}
            closeIcon>
                <Modal.Header>导出Zoom课程录像</Modal.Header>
                <Modal.Content image>
                    <Modal.Description>
                        <Header>导出步骤(1.根据当前系统复制命令-下载课程视频，上传至百度云盘 2.点击【一键删除】按钮)</Header>
                        <p>1. 将下方命令复制到剪切板，在终端（mac）或Powershell（windows）中回车执行</p>
                        <p>2. 待下载完成后，到目标目录中找到文件</p>
                        <p>3. 将第二步的文件上传至百度云盘</p>
                        <p>4. 点击底部【一键删除-清除Zoom云空间】按钮，释放Zoom云空间</p>
                        {
                            this.state.windowsCopy && <div>
                                <textarea readOnly cols="100" rows="10">
                                        {this.state.windowsCopy}
                                </textarea>
                                <br/>
                                <Button className="ui green button" onClick={()=>{}}>windows-手动复制到剪切板</Button>
                                <br/>
                            </div>
                        }
                        {
                            this.state.macCopy && <div>
                                <textarea readOnly cols="100" rows="10">
                                        {this.state.macCopy}
                                </textarea>
                                <br/>
                                <Button className="ui green button" onClick={()=>{}}>mac-手动复制到剪切板</Button>
                                <br/>
                            </div>
                        }
                        <br/>
                        <br/>
                        <Button className="ui green button" onClick={this.deleteZoom}>一键删除-清除Zoom云空间</Button>
                        <br/>
                        <br/>
                    </Modal.Description>
                </Modal.Content>
            </Modal>
        )
    }

    handleSort(clickedColumn) {
        const {column, direction, classes} = this.state;

        if (column !== clickedColumn) {
            this.setState({
                column: clickedColumn,
                classes: _.sortBy(classes, [clickedColumn]),
                direction: 'ascending'
            });

            return;
        }

        if (direction === 'ascending') {
            this.setState({
                classes: classes.reverse(),
                direction: 'descending'
            });

            return;
        }

        if (direction === 'descending') {
            this.setState({
                classes: classes.sort(nearestToper),
                direction: null,
                column: null
            });
        }
    }

    async gotoPage(e, {activePage}) {
        let p = this.state.pagination;
        p.current_page = activePage;

        this.setState({pagination: p}, async () => {
            await this.searchClasses();
        })
    }

    searchClassesByStatus(status) {
        let searchParams = this.state.searchParams
        searchParams.statuses = [status]

        this.setState({
            searchParams,
            pagination: BuzzPaginationData
        }, async () => {
            await this.searchClasses()
        })
    }

    openAdminNeueClassDetail() {

    }

    copy(text){
        var oInput = document.createElement('input');
        oInput.value = text;
        document.body.appendChild(oInput);
        oInput.select(); // 选择对象
        document.execCommand("Copy"); // 执行浏览器复制命令
        oInput.className = 'oInput';
        oInput.style.display='none';
        alert('复制成功!');
    }

    async deleteZoom() {
        let deleteConfirm = window.prompt('这个操作不可恢复，一旦删除，此页课程的Zoom云空间视频数据都将被永久删除。如果你确定要删除，请确保已经进行过百度云的‘搬砖转移’工作！！！确认删除请输入“删除”，否则撤销操作：')

        if (String(deleteConfirm) !== '删除') {
            window.alert('删除操作已取消')
            return
        }

        try {
            this.setState({loading: true});
            let classIds = [];

            this.state.classes.map((item)=>{
            classIds.push(item.class_id);
            });

            if(classIds.length){
                //api
                let recordingResult = await ServiceProxy.proxyTo({
                    body: {
                        uri: '{buzzApi}/class/deleteRecordingsByClassId',
                        method: 'POST',
                        json: {
                            class_ids: classIds
                        }
                    }
                })

                this.setState({
                    loading: false
                }, ()=>{
                    alert('删除成功！');
                });
            }else{
                alert('未选择有效班级');
            }
        } catch (error) {
            this.setState({error: true, message: JSON.stringify(error.result || error)})
        } finally {
            this.setState({loading: false});
        }
    }

}
