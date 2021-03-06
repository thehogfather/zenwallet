import React, { Component } from 'react'
import Flexbox from 'flexbox-react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import Container from '../Container/Container'
import Main from '../Main/Main'
import Topbar from '../Topbar/Topbar'
import Sidebar from '../Sidebar/Sidebar'

class Layout extends Component {
    static propTypes = {
      className: PropTypes.string,
    }

    render() {
      const className = classnames('main', this.props.className)

      return (
        <Container className={className} >
          <Sidebar title="Zen Protocol" />
          <Main>
            <Topbar />
            <Flexbox flexDirection="column" flexGrow={1} className="content-container">
              {this.props.children}
            </Flexbox>
          </Main>
        </Container>
      )
    }
}

export default Layout
