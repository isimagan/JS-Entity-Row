export const ROW_STYLES = `
  :host { display: block; }
  :host([hidden]) { display: none !important; }
  .row {
    display: flex;
    align-items: center;
    min-height: 40px;
    color: var(--primary-text-color);
  }
  .visual {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    margin-inline-end: 16px;
    flex: 0 0 40px;
  }
  state-badge { flex: 0 0 auto; }
  .info {
    min-width: 0;
    flex: 1 1 auto;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
  .name, .secondary, .state {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .secondary {
    color: var(--secondary-text-color);
    font-size: var(--ha-font-size-s, 12px);
    line-height: 16px;
  }
  .state {
    margin-inline-start: 16px;
    text-align: end;
    flex: 0 1 auto;
    color: var(--secondary-text-color);
  }
`;
