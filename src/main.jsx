import React from "react"
import moment from "moment"
import cx from "classnames"

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
    WDAYS = ["su", "mo", "tu", "we", "th", "fr", "sa"];

const LevelTags = {
    month: ({curdate, ...props})=> {
        let mnames = props.month_names || MONTHS,
            wdays = props.wday_names || WDAYS,
            day = moment(curdate).startOf('month').startOf('week').startOf('day'),//.day(-7),
            last = moment(curdate).endOf('month').endOf('week').startOf('day'),
            days = [];

        while (day.isBefore(last)) {
            let week = [];
            for (let d = 0; d < 7; d++) {
                week.push(<div
                    className={ cx('cell', { out: day.month() != curdate.month(), today: day.dayOfYear() == moment().dayOfYear() }) }
                    key={ d }>{ day.date() }</div>);
                day.add(1, 'd');
            }
            days.push(<div className="row week" key={ day.date() }>{ week }</div>);
        }

        return (
            <div className="body month">
                <div className="row">
                    <div className="prev" onClick={ ()=>{props.shift(curdate.subtract(1, 'M'))} }> &lt; </div>
                    <div className="title"
                         onClick={ ()=>{props.level( 'year' )} }>{ mnames[curdate.month()] }&nbsp;{ curdate.year() }</div>
                    <div className="next" onClick={ ()=>{props.shift(curdate.add(1, 'M'))} }> &gt; </div>
                </div>
                <div className="row wdays">
                    { _.map(wdays, wd => <div className="cell wdname" key={ wd }>{ wd }</div>) }
                </div>
                <div className="days">{ days }</div>
            </div>
        );
    },
    year: ({curdate, ...props})=> {
    let mnames = props.month_names || MONTHS,
        months = [];

    for (let j = 0; j < 3; j++) {
        let season = [];
        for (let i = 0; i < 4; i++) {
            let k = j * 4 + i;
            season.push(<div className='cell' key={ k }
                             onClick={ ()=>{ props.level( 'month', new moment(curdate).month( k ) ) }}>{ mnames[ k ] }</div>);
        }
        months.push(<div className="row" key={ j }>{ season }</div>);
    }

    return (
        <div className="body year">
            <div className="row">
                <div className="prev" onClick={ ()=>{props.shift(curdate.subtract(1, 'Y'))} }> &lt; </div>
                <div className="title" onClick={ ()=>{props.level( 'decade' )} }>{ curdate.year() }</div>
                <div className="next" onClick={ ()=>{props.shift(curdate.add(1, 'Y'))} }> &gt; </div>
            </div>
            <div className="months">{ months }</div>
        </div>
    );
},
    decade: ({curdate, ...props})=> {
    let start = (Math.floor(curdate.year() / 10)) * 10 - 1,
        years = [];

    for (let j = 0; j < 3; j++) {
        let ys = [];
        for (let i = 0; i < 4; i++) {
            let k = j * 4 + i;
            ys.push(<div className={cx('cell',{out:!k||k==11})} key={ k }
                             onClick={ ()=>{ props.level( 'year', new moment().year(start + k) ) }}>{ start + k }</div>);
        }
        years.push(<div className="row" key={ j }>{ ys }</div>);
    }

    return (
        <div className="body decade">
            <div className="row">
                <div className="prev" onClick={ ()=>{props.shift(curdate.subtract(10, 'Y'))} }> &lt; </div>
                <div className="title">{ start + 1 } - { start + 10 }</div>
                <div className="next" onClick={ ()=>{props.shift(curdate.add(10, 'Y'))} }> &gt; </div>
            </div>
            <div className="years">{ years }</div>
        </div>
    );
}
};

export default React.createClass({
    componentWillMount() {
        this.setState({curdate: moment(this.props.date || new Date()), level:'month'});
    },

    onShift(date) {
        this.setState({curdate: date});
    },

    onLevel(level, date) {
        let dt = {level: level};
        date && (dt.curdate = date);
        this.setState(dt);
    },

    render() {
//        let tag = this.state.level.substr(0, 1).toUpperCase() + this.state.level.substr(1);
        return React.createElement(LevelTags[this.state.level], Object.assign({}, this.props, { curdate: this.state.curdate, shift: this.onShift, level: this.onLevel }));
    }
})