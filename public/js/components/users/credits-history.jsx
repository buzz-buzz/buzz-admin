import React from 'react'
import {connect} from 'react-redux';
import history from './balance-history'

export default connect(store => ({
    history: store.creditsHistory
}), null)(history)
