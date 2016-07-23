import React from "react"
import {TransitionMotion, spring } from 'react-motion'
import moment from "moment"
import cx from "classnames"

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
    WDAYS = ["su", "mo", "tu", "we", "th", "fr", "sa"];

const getMinMax = function (level, curdate, pMin, pMax) {
    let max = pMax && moment(pMax),
        min = pMin && moment(pMin);

    switch (level) {
        case 'month':
            return {
                min: min && min.isAfter(curdate.startOf('month')) && min,
                max: max && max.isBefore(curdate.endOf('month')) && max
            };
        case 'year':
            return {
                min: min && curdate.year() == min.year() && min.month() + 1,
                max: max && curdate.year() == max.year() && max.month() + 1
            };
        case 'decade':
            let start = (Math.floor(curdate.year() / 10)) * 10 - 1;
            min = min && min.year();
            max = max && max.year();
            return {
                min: min >= start && min <= start + 10 && min,
                max: max >= start && max <= start + 10 && max
            };
    }
};

const Tags = {
    month_head: ({curdate, lim, level, month_names, wday_names, onShift, onLevel}) =>
        <div className={"head " + level}>
            <div className="row">
                { lim.min ? <div className="noshift"></div> : <div className="prev"
                                                                   onClick={ ()=>{onShift(curdate.subtract(1, 'M'))} }> &lt; </div>}
                <div className="title"
                     onClick={ ()=>{onLevel( 'year', false )} }>{ (month_names || MONTHS)[curdate.month()] }&nbsp;{ curdate.year() }</div>
                { lim.max ? <div className="noshift"></div> : <div className="next"
                                                                   onClick={ ()=>{onShift(curdate.add(1, 'M'))} }> &gt; </div> }
            </div>
            <div className="row wdays">
                { _.map(wday_names || WDAYS, wd => <div className="cell wdname" key={ wd }>{ wd }</div>) }
            </div>
        </div>,

    year_head: ({curdate, lim, level, onShift, onLevel})=>
        <div className={"head " + level}>
            <div className="row">
                { lim.min ? <div className="noshift"></div> : <div className="prev"
                                                                   onClick={ ()=>{onShift(curdate.subtract(1, 'Y'))} }> &lt; </div> }
                <div className="title" onClick={ ()=>{onLevel( 'decade', false )} }>{ curdate.year() }</div>
                { lim.max ? <div className="noshift"></div> : <div className="next"
                                                                   onClick={ ()=>{onShift(curdate.add(1, 'Y'))} }> &gt; </div> }
            </div>
        </div>
    ,

    decade_head: ({curdate, lim, level, onShift})=> {
        let start = (Math.floor(curdate.year() / 10)) * 10 - 1;
        return <div className={"head " + level}>
            <div className="row">
                { lim.min ? <div className="noshift"></div> : <div className="prev"
                                                                   onClick={ ()=>{onShift(curdate.subtract(10, 'Y'))} }> &lt; </div> }
                <div className="title">{ start + 1 } - { start + 10 }</div>
                { lim.max ? <div className="noshift"></div> : <div className="next"
                                                                   onClick={ ()=>{onShift(curdate.add(10, 'Y'))} }> &gt; </div> }
            </div>
        </div>
    },

    month_body: ({curdate, lim, onSelect})=> {
        let day = curdate.clone().startOf('month').startOf('week').startOf('day'),
            last = day.clone().add(42, 'd'),
            days = [];

        while (day.isBefore(last)) {
            let week = [];
            for (let d = 0; d < 7; d++) {
                let isOut = (lim.max && day.isAfter(lim.max)) || (lim.min && day.isBefore(lim.min)),
                    date = day.clone();
                week.push(<div
                    className={ cx('cell', {
            other: day.month() != curdate.month(),
            out: isOut,
            today: day.dayOfYear() == moment().dayOfYear() })
            }
                    onClick={ isOut ? null : ()=>{onSelect( date )} }
                    key={ d }>{ day.date() }</div>);
                day.add(1, 'd');
            }
            days.push(<div className="row week" key={ day.date() }>{ week }</div>);
        }

        return <div className="days">{ days }</div>;
    },

    year_body: ({curdate, lim, month_names, onLevel})=> {
        let months = [];

        for (let j = 0; j < 3; j++) {
            let season = [];
            for (let i = 0; i < 4; i++) {
                let k = j * 4 + i,
                    isOut = (lim.max && k + 1 > lim.max) || (lim.min && k + 1 < lim.min);

                season.push(<div className={ cx('cell', { out: isOut })} key={ k }
                                 onClick={ isOut ? null : ()=>{ onLevel( 'month', true, new moment(curdate).month( k ) ) }}>{ (month_names || MONTHS)[ k ] }</div>);
            }
            months.push(<div className="row" key={ j }>{ season }</div>);
        }

        return <div className="months">{ months }</div>;
    },

    decade_body: ({curdate, lim, onLevel})=> {
        let start = (Math.floor(curdate.year() / 10)) * 10 - 1,
            years = [];

        for (let j = 0; j < 3; j++) {
            let ys = [];
            for (let i = 0; i < 4; i++) {
                let k = j * 4 + i,
                    isOut = (lim.max && start + k > lim.max) || (lim.min && start + k < lim.min);
                ys.push(<div className={cx('cell',{other:!k||k==11, out: isOut })} key={ k }
                             onClick={ isOut ? null : ()=>{ onLevel( 'year', true, new moment().year(start + k) ) }}>{ start + k }</div>);
            }
            years.push(<div className="row" key={ j }>{ ys }</div>);
        }

        return <div className="years">{ years }</div>;
    }
};

export default React.createClass({
    prevDate: null,
    prevLevel: null,

    componentWillMount() {
        let date = moment(this.props.date || new Date());
        this.prevdate = date.clone();
        this.prevlevel = 'month';
        this.setState({curdate: date, level: 'month', animId: 0});
    },

    onShift(date) {
        this.prevdate = this.state.curdate.clone();
        this.prevlevel = this.state.level;
        this.setState({
            curdate: date,
            direction: date.isAfter(this.state.curdate) ? 'right' : 'left',
            animId: this.state.animId + 1
        });
    },

    onLevel(level, is_zoom, date) {
        let dt = {
            level: level,
            direction: is_zoom ? 'down' : 'up',
            animId: this.state.animId + 1
        };
        this.prevlevel = this.state.level;
        this.prevdate = this.state.curdate.clone();
        date && (dt.curdate = date);
        this.setState(dt);
    },

    onSelect(date) {
        console.log('Date selected', date.toString());
    },

    willEnterLeave(welcome){
        switch (this.state.direction) {
            case 'left':
                return {zoom: 0, slide: welcome ? -1 : spring(1)};
            case 'right':
                return {zoom: 0, slide: welcome ? 1 : spring(-1)};
            case 'up':
                return {zoom: welcome ? 1 : spring(-1), slide: 0};
            case 'down':
                return {zoom: welcome ? -1 : spring(1), slide: 0};
        }
        return null;
    },

    render(){
        let p = this.props, s = this.state;
        return (
            <div className={ cx("calendar_wl_box", p.className)}>
                {
                    React.createElement(Tags[s.level + '_head'], Object.assign({}, p, {
                        curdate: moment(s.curdate),
                        onShift: this.onShift,
                        onLevel: this.onLevel,
                        level: s.level,
                        lim : getMinMax( s.level, moment(s.curdate), p.minDate, p.maxDate )
                        }))
                    }{
            <TransitionMotion
                willEnter={ ()=>this.willEnterLeave(true) }
                willLeave={ ()=>this.willEnterLeave(false) }
                styles={[{ key: 'k' + s.animId, style:{ slide:spring(0), zoom:spring(0) }}]}
            >{ interpolate => <div className="anim_container">{
                interpolate.map( conf => {
                    let isnew = conf.key == 'k'+s.animId,
                        level = isnew ? s.level : this.prevlevel,
                        date = moment(isnew ? s.curdate.clone() : this.prevdate);
                    return <div className={"body " + level} key={ conf.key }
                                style={ {
                                left: conf.style.slide*100 + '%',
                                opacity: 1 - Math.abs(conf.style.zoom),
                                transform: 'scale( '+(conf.style.zoom + 1 ) + ')',
                                zIndex: isnew ? 2 : 1
                                } }>{
                        React.createElement(Tags[ level + '_body' ], Object.assign({}, p, {
                            curdate: date,
                            onShift: this.onShift,
                            onLevel: this.onLevel,
                            onSelect: this.onSelect,
                            lim : getMinMax( level, date, p.minDate, p.maxDate )
                            }))
                        }</div>})
                }</div>
                }
            </TransitionMotion>}
            </div>);
    }
})