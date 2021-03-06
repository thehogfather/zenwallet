import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import Flexbox from 'flexbox-react'

import { truncateString } from '../../../utils/helpers'
import Layout from '../UI/Layout/Layout'
import CopyableTableCell from '../UI/CopyableTableCell'

import SingleTxDelta from './SingleTxDelta'

@inject('txhistory')
@observer
class TxHistory extends Component {
  componentDidMount() {
    this.props.txhistory.fetch()
  }

  renderTransactionsCell(tx) {
    if (tx.deltas.length === 1) {
      return (
        <SingleTxDelta tx={tx.deltas[0]} />
      )
    }

    if (tx.deltas.length > 1) {
      const deltasRows = tx.deltas.map(tx => (
        <tr key={tx.hash}><SingleTxDelta tx={tx} /></tr>
      ))

      return (
        <td colSpan="3" className="multiple-inner-tx-deltas">
          <table>
            <tbody>
              {deltasRows}
            </tbody>
          </table>
        </td>
      )
    }
  }

  render() {
    const { txhistory } = this.props

    const tableRows = txhistory.transactions.map(tx => {
      return (
        [
          <tr key={tx.txHash}>
            <CopyableTableCell string={tx.txHash} />
            { this.renderTransactionsCell(tx) }
          </tr>,
          <tr key={`${tx.txHash}-separator`} className="separator" />,
        ]
      )
    })

    return (
      <Layout className="balances">

        <Flexbox className="page-title">
          <h1>Transactions</h1>
        </Flexbox>

        <Flexbox className="balance-list">
          <table>
            <thead>
              <tr>
                <th className="align-left">Transaction Hash</th>
                <th className="align-left">Asset Hash</th>
                <th className="align-left">Asset Name</th>
                <th className="align-right">Amount</th>
              </tr>
              <tr className="separator" />
            </thead>
            <tbody>
              {tableRows}
            </tbody>
          </table>
        </Flexbox>

      </Layout>
    )
  }
}

export default TxHistory
