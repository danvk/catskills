import 'dygraphs/dist/dygraph.css';

import DygraphBase from 'dygraphs';
import React from 'react';

type Options = Parameters<DygraphBase['updateOptions']>[0];
export interface Props extends Options {
  style?: React.CSSProperties;
  className?: string;
}

export type UnwrappedDygraph = DygraphBase;

export class Dygraph extends React.Component<Props> {
  dygraph!: DygraphBase;
  divRef: React.RefObject<HTMLDivElement>;

  constructor(props: Props) {
    super(props);
    this.divRef = React.createRef();
  }

  componentDidMount() {
    const {file, style: _1, className: _2, ...others} = this.props;
    if (!file) {
      throw new Error('Must specify file prop');
    }
    this.dygraph = new DygraphBase(this.divRef.current!, file, others);
  }

  componentDidUpdate(prevProps: Props) {
    const {style: _1, className: _2, ...options} = this.props;
    const {style: _3, className: _4, ...oldOptions} = prevProps;
    const diff: Partial<Options> = {};
    for (const key of Object.keys(options) as (keyof Options)[]) {
      if (options[key] !== oldOptions[key]) {
        diff[key] = options[key];
      }
    }
    for (const key of Object.keys(oldOptions) as (keyof Options)[]) {
      if (options[key] !== oldOptions[key]) {
        diff[key] = options[key];
      }
    }
    if (Object.keys(diff).length > 0) {
      this.dygraph.updateOptions(options);
    }
  }

  componentWillUnmount() {
    this.dygraph.destroy();
  }

  render() {
    return <div className={this.props.className} ref={this.divRef} style={this.props.style} />;
  }
}
