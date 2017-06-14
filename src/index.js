import createClass from 'create-react-class'
import PropTypes from 'prop-types'
import React from 'react'

import style from './style'

export default createClass({
  propTypes: {
    layers: PropTypes.arrayOf(PropTypes.string).isRequired,
    isStatic: PropTypes.bool,
    staticFallback: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object
  },

  getInitialState () {
    return {
      rootElemWidth: 0,
      rootElemHeight: 0,
      isOnHover: false,
      container: {},
      shine: {},
      layers: []
    }
  },

  componentDidMount () {
    if (!this.props.isStatic) {
      this.setState({
        // eslint-disable-line react/no-did-mount-set-state
        // this is a legit use case. we must trigger a re-render. don't worry.
        rootElemWidth:
          this.root.clientWidth ||
            this.root.offsetWidth ||
            this.root.scrollWidth,
        rootElemHeight:
          this.root.clientHeight ||
            this.root.offsetHeight ||
            this.root.scrollHeight
      })
    }
  },

  handleMove ({pageX, pageY}) {
    const layerCount = this.props.layers.length // the number of layers

    const {rootElemWidth, rootElemHeight} = this.state

    const bodyScrollTop =
      document.body.scrollTop ||
      document.getElementsByTagName('html')[0].scrollTop
    const bodyScrollLeft = document.body.scrollLeft
    const offsets = this.root.getBoundingClientRect()
    const wMultiple = 320 / rootElemWidth
    const offsetX =
      0.52 - (pageX - offsets.left - bodyScrollLeft) / rootElemWidth // cursor position X
    const offsetY =
      0.52 - (pageY - offsets.top - bodyScrollTop) / rootElemHeight // cursor position Y
    const dy = pageY - offsets.top - bodyScrollTop - rootElemHeight / 2 // center Y of container
    const dx = pageX - offsets.left - bodyScrollLeft - rootElemWidth / 2 // center X of container
    const yRotate = (offsetX - dx) * (0.07 * wMultiple) // rotation for container Y
    const xRotate = (dy - offsetY) * (0.1 * wMultiple) // rotation for container X

    const arad = Math.atan2(dy, dx) // angle between cursor and center of container in RAD

    const rawAngle = arad * 180 / Math.PI - 90 // convert rad to degrees
    const angle = rawAngle < 0 ? rawAngle + 360 : rawAngle

    this.setState({
      container: {
        transform:
          `rotateX(${xRotate}deg) rotateY(${yRotate}deg)` +
            (this.state.isOnHover ? ' scale3d(1.07,1.07,1.07)' : '')
      },
      shine: {
        background: `linear-gradient(${angle}deg, rgba(255, 255, 255, ${(pageY -
          offsets.top -
          bodyScrollTop) /
          rootElemHeight *
          0.4}) 0%, rgba(255, 255, 255, 0) 80%)`,
        transform: `translateX(${offsetX * layerCount -
          0.1}px) translateY(${offsetY * layerCount - 0.1}px)`
      },
      layers: this.props.layers.map((_, idx) => ({
        transform: `translateX(${offsetX *
          (layerCount - idx) *
          (idx * 2.5 / wMultiple)}px) translateY(${offsetY *
          layerCount *
          (idx * 2.5 / wMultiple)}px)`
      }))
    })
  },

  handleTouchMove (evt) {
    evt.preventDefault()
    const {pageX, pageY} = evt.touches[0]
    this.handleMove({pageX, pageY})
  },

  handleEnter () {
    this.setState({isOnHover: true})
  },

  handleLeave () {
    this.setState({
      isOnHover: false,
      container: {},
      shine: {},
      layers: []
    })
  },

  renderShadow () {
    return (
      <div
        style={{
          ...style.shadow,
          ...(this.state.isOnHover ? style.shadowOnHover : {})
        }}
      />
    )
  },

  renderLayers () {
    return (
      <div style={style.layers}>
        {this.props.layers &&
          this.props.layers.map((imgSrc, idx) =>
            <div
              style={{
                backgroundImage: `url(${imgSrc})`,
                ...style.renderedLayer,
                ...(this.state.layers[idx] ? this.state.layers[idx] : {})
              }}
              key={idx}
            />
          )}
      </div>
    )
  },

  renderShine () {
    return <div style={{...style.shine, ...this.state.shine}} />
  },

  render () {
    if (this.props.isStatic) {
      return (
        <div
          style={{
            ...style.root,
            ...(this.props.style ? this.props.style : {})
          }}
          className={this.props.className || ''}>
          <img style={style.staticFallback} src={this.props.staticFallback} />
        </div>
      )
    }

    return (
      <div
        style={{
          ...style.root,
          transform: `perspective(${this.state.rootElemWidth * 3}px)`,
          ...(this.props.style ? this.props.style : {})
        }}
        onMouseMove={this.handleMove}
        onMouseEnter={this.handleEnter}
        onMouseLeave={this.handleLeave}
        onTouchMove={this.handleTouchMove}
        onTouchStart={this.handleEnter}
        onTouchEnd={this.handleLeave}
        className={this.props.className || ''}
        ref={node => (this.root = node)}>
        <div style={{...style.container, ...this.state.container}}>
          {this.renderShadow()}
          {this.renderLayers()}
          {this.renderShine()}
        </div>
      </div>
    )
  }
})
