import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { inject, observer } from 'mobx-react'
import Flexbox from 'flexbox-react'
import Autosuggest from 'react-autosuggest'
import classnames from 'classnames'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'

import { truncateString } from '../../../../utils/helpers'

@inject('balances')
@observer
class AutoSuggestAssets extends Component {
  static propTypes = {
    className: PropTypes.string,
  }
  state = {
    suggestionValue: '',
    suggestions: [],
    assetError: false,
    isValid: false,
    chosenAssetName: this.props.assetName,
  }

  componentDidMount() {
    const { asset, chosenAssetName } = this.props
    if (asset) {
      const suggestions = this.getSuggestions(asset)
      const isValid = (suggestions.length === 1 && suggestions[0].asset === asset)
      const hasError = (suggestions.length === 0 && asset.length > 0 && !isValid)
      this.setState({ suggestionValue: asset, assetError: hasError })
      if (isValid) {
        this.validateAssetStates(suggestions[0].asset)
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.status === 'success') {
      this.setState({
        suggestionValue: '',
        chosenAssetName: '',
      })
    }
  }

  getSuggestionValue = suggestion => suggestion.asset

  renderSuggestion = suggestion => (
    <div className="suggestionItem">
      {suggestion.name} ({truncateString(suggestion.asset)})
    </div>
  )

  onSuggestionSelected = (event, { suggestion }) => {
    const value = suggestion.asset

    this.setState({
      suggestionValue: value,
      chosenAssetName: suggestion.name,
    })
    this.validateAssetStates(value)
  }

  onChange = (event, { newValue, method }) => {
    const value = newValue.trim()
    const userPressedUpOrDown = (method === 'down' || method === 'up')
    if (!userPressedUpOrDown) {
      this.setState({
        suggestionValue: value,
        chosenAssetName: null,
      })
      this.validateAssetStates(value)
    }
  }

  onAssetBlur = () => {
    const { suggestionValue } = this.state
    const val = suggestionValue.trim()
    const suggestions = this.getSuggestions(val)
    this.setState({ isValid: false })
    this.validateAssetStates(val)
  }

  onAssetFocus = () => {
    this.validateAssetStates(this.state.suggestionValue)
  }

  validateAssetStates(val) {
    const suggestions = this.getSuggestions(val)
    const hasError = (suggestions.length === 0 && val.length > 0)
    const isValid = (suggestions.length === 1 && suggestions[0].asset === val)
    this.setState({ assetError: hasError, isValid })
    if (isValid) {
      const chosenAsset = suggestions[0]
      this.setState({ chosenAssetName: chosenAsset.name })
      this.props.sendData({
        asset: chosenAsset.asset,
        assetType: chosenAsset.assetType,
        assetIsValid: isValid,
        assetName: chosenAsset.name,
      })
    } else {
      this.props.sendData({
        assetIsValid: false,
        assetName: '',
      })
    }
  }

  getSuggestions = value => {
    const { balances } = this.props
    balances.searchQuery = value
    return balances.filtered
  }

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({ suggestions: this.getSuggestions(value) })
  }

  onSuggestionsClearRequested = () => {
    this.setState({ suggestions: [] })
  }

  shouldRenderSuggestions = (value) => {
    const suggestions = this.getSuggestions(value)
    return !(suggestions.length === 1 && suggestions[0].asset === value)
  }

  renderErrorMessage() {
    const { assetError } = this.state
    if (assetError) {
      return (
        <div className="input-message error">
          <FontAwesomeIcon icon={['far', 'exclamation']} />
          <span>You don't have such an asset</span>
        </div>
      )
    }
  }

  renderChosenAssetName() {
    const { chosenAssetName } = this.state
    if (chosenAssetName) {
      return (
        <div className="chosenAssetName">{chosenAssetName}</div>
      )
    }
  }

  render() {
    const {
      suggestionValue, suggestions, assetError, isValid,
    } = this.state
    let assetClassNames = (assetError ? 'full-width error' : 'full-width')
    if (isValid) { assetClassNames = classnames('is-valid', assetClassNames) }

    const inputProps = {
      type: 'search',
      placeholder: 'Start typing the asset name',
      value: suggestionValue,
      className: assetClassNames,
      onChange: this.onChange,
      onBlur: this.onAssetBlur,
      onFocus: this.onAssetFocus,
    }

    return (
      <Flexbox flexGrow={1} flexDirection="column" className="select-asset">
        <label htmlFor="asset">Asset</label>

        <Autosuggest
          suggestions={suggestions}
          onSuggestionSelected={this.onSuggestionSelected}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={this.getSuggestionValue}
          renderSuggestion={this.renderSuggestion}
          shouldRenderSuggestions={this.shouldRenderSuggestions}
          inputProps={inputProps}
        />
        {this.renderChosenAssetName()}
        {this.renderErrorMessage()}

      </Flexbox>

    )
  }
}

export default AutoSuggestAssets
