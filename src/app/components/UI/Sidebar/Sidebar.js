const path = require('path')
import React,{Component} from 'react'
import autobind from 'class-autobind'
import {Link, NavLink} from 'react-router-dom'
import PropTypes from 'prop-types'
import classnames from 'classnames'

class Sidebar extends Component {
    constructor() {
        super()
        autobind(this)
    }

    static propTypes = {
        className: PropTypes.string,
        title: PropTypes.string
    }

    static defaultProps = {
        title:'Zen Wallet'
    }

    render() {
        const {title} = this.props

        const logoSrc = path.join(__dirname, '../../../assets/img/logo.png')

        const className = classnames('sidebar', this.props.className)

        return (
          <nav className={className}>

              <header>
                <Link to="/">
                  <img src={logoSrc} alt="Zen Protocol Logo"/>
                </Link>
              </header>

              <ul>
                <li><NavLink activeClassName={'active'} to="/">Home</NavLink></li>
                <li><NavLink activeClassName={'active'} to="/receive">Receive Funds</NavLink></li>
                <li><NavLink activeClassName={'active'} to="/send-tx">Send Tx</NavLink></li>
                <li><NavLink activeClassName={'active'} to="/activate-contract">Contract</NavLink></li>
                <li><a>Settings</a></li>
              </ul>

            </nav>
        )
    }
}

export default Sidebar