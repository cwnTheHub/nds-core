import React from 'react'
import { shallow, mount } from 'enzyme'

import MiniExpandCollapse from '../MiniExpandCollapse'
import Box from '../../../core/core-box/Box'
import Paragraph from '../../../core/core-paragraph/Paragraph'

describe('MiniExpandCollapse', () => {
  const doShallow = () =>
    shallow(
      <MiniExpandCollapse expandTitle="Hide details" collapseTitle="Show details" size="large">
        <Box vertical={4}>
          <Paragraph>The content to be expanded.</Paragraph>
        </Box>
      </MiniExpandCollapse>
    )

  const doMount = () =>
    mount(
      <MiniExpandCollapse expandTitle="Hide details" collapseTitle="Show details" size="large">
        <Box vertical={4}>
          <Paragraph>The content to be expanded.</Paragraph>
        </Box>
      </MiniExpandCollapse>
    )

  it('renders correctly', () => {
    const miniExpandCollapse = doShallow()
    expect(miniExpandCollapse).toMatchSnapshot()
  })

  it('renders children', () => {
    const miniExpandCollapse = doMount()
    expect(miniExpandCollapse.find('Paragraph').exists()).toBeTruthy()
  })

  it('renders a title correctly', () => {
    const miniExpandCollapse = doMount()
    expect(
      miniExpandCollapse
        .find('Link')
        .children()
        .text()
    ).toEqual('Show details')
  })

  it('renders an interactive icon', () => {
    const miniExpandCollapse = doMount()
    expect(miniExpandCollapse.find('CaretDown').exists()).toBeTruthy()
  })

  it('renders A11y content', () => {
    const miniExpandCollapse = mount(
      <MiniExpandCollapse
        expandTitle="Hide details"
        collapseTitle="Show details"
        size="large"
        a11yLabel="detailed description"
      >
        <Box vertical={4}>
          <Paragraph>The content to be expanded.</Paragraph>
        </Box>
      </MiniExpandCollapse>
    )
    expect(miniExpandCollapse.find('A11yContent').exists()).toBeTruthy()
  })

  it('activates the onToggle event when clicked', () => {
    const props = {
      expandTitle: 'Hide details',
      collapseTitle: 'Show details',
      size: 'large',
      a11yLabel: 'detailed description',
      onToggle: jest.fn(),
    }

    const miniExpandCollapse = mount(
      <MiniExpandCollapse {...props}>
        <Box vertical={4}>
          <Paragraph>The content to be expanded.</Paragraph>
        </Box>
      </MiniExpandCollapse>
    )

    miniExpandCollapse
      .find('Link')
      .children()
      .simulate('click')

    expect(props.onToggle).toHaveBeenCalled()
  })
})