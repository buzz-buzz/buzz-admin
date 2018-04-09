import _ from 'lodash'
import { zones } from 'moment-timezone/data/meta/latest.json'

export default {
  list: _.keys(zones).map(key=>({
    key, value: key, text: key
  }))
}
