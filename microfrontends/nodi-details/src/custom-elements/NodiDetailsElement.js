import React from 'react';
import ReactDOM from 'react-dom';
import retargetEvents from 'react-shadow-dom-retarget-events';

import { StylesProvider, ThemeProvider, jssPreset } from '@material-ui/core/styles';
import { createMuiTheme } from '@material-ui/core';
import { create as jssCreate } from 'jss';

import KeycloakContext from 'auth/KeycloakContext';
import NodiDetailsContainer from 'components/NodiDetailsContainer';
import setLocale from 'i18n/setLocale';
import {
  subscribeToWidgetEvent,
  subscribeToWidgetEvents,
  createWidgetEventPublisher,
} from 'helpers/widgetEvents';
import {
  INPUT_EVENT_TYPES,
  KEYCLOAK_EVENT_TYPE,
  OUTPUT_EVENT_TYPES,
} from 'custom-elements/widgetEventTypes';

const getKeycloakInstance = () =>
  (window &&
    window.entando &&
    window.entando.keycloak && { ...window.entando.keycloak, initialized: true }) || {
    initialized: false,
  };

const ATTRIBUTES = {
  id: 'id',
  hidden: 'hidden',
  locale: 'locale',
  disableDefaultEventHandler: 'disable-default-event-handler', // custom element attribute names MUST be written in kebab-case
  config: 'config',
};

class NodiDetailsElement extends HTMLElement {
  jss;

  container;

  mountPoint;

  keycloak = getKeycloakInstance();

  unsubscribeFromWidgetEvents;

  unsubscribeFromKeycloakEvent;

  defaultEventHandlerDisabled;

  onError = createWidgetEventPublisher(OUTPUT_EVENT_TYPES.error);

  muiTheme;

  static get observedAttributes() {
    return Object.values(ATTRIBUTES);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.container || oldValue === newValue) {
      return;
    }
    if (!Object.values(ATTRIBUTES).includes(name)) {
      throw new Error(`Untracked changed attribute: ${name}`);
    }
    if (name === ATTRIBUTES.disableDefaultEventHandler) {
      this.onToggleDisableDefaultEvent();
    }
    this.render();
  }

  connectedCallback() {
    this.container = document.createElement('div');
    this.mountPoint = document.createElement('div');
    this.container.appendChild(this.mountPoint);

    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(this.container);

    this.jss = jssCreate({
      ...jssPreset(),
      insertionPoint: this.container,
    });

    this.muiTheme = createMuiTheme({
      props: {
        MuiDialog: {
          container: this.mountPoint,
        },
        MuiPopover: {
          container: this.mountPoint,
        },
      },
    });

    this.keycloak = { ...getKeycloakInstance(), initialized: true };

    this.unsubscribeFromKeycloakEvent = subscribeToWidgetEvent(KEYCLOAK_EVENT_TYPE, () => {
      this.keycloak = { ...getKeycloakInstance(), initialized: true };
      this.render();
    });

    this.onToggleDisableDefaultEvent();

    this.render();

    retargetEvents(shadowRoot);
  }

  disconnectedCallback() {
    if (this.unsubscribeFromWidgetEvents) {
      this.unsubscribeFromWidgetEvents();
    }
    if (this.unsubscribeFromKeycloakEvent) {
      this.unsubscribeFromKeycloakEvent();
    }
  }

  defaultWidgetEventHandler() {
    return (evt) => {
      const { tableSelect } = INPUT_EVENT_TYPES;
      const { id } = ATTRIBUTES;
      switch (evt.type) {
        case tableSelect: {
          this.setAttribute(id, evt.detail.payload.id);
          break;
        }
        default:
          throw new Error(`Unsupported event: ${evt.type}`);
      }
    };
  }

  onToggleDisableDefaultEvent() {
    const disableEventHandler = this.getAttribute(ATTRIBUTES.disableDefaultEventHandler) === 'true';

    if (disableEventHandler !== this.defaultEventHandlerDisabled) {
      if (!disableEventHandler) {
        const defaultWidgetEventHandler = this.defaultWidgetEventHandler();

        this.unsubscribeFromWidgetEvents = subscribeToWidgetEvents(
          Object.values(INPUT_EVENT_TYPES),
          defaultWidgetEventHandler
        );
      } else {
        if (this.unsubscribeFromWidgetEvents) {
          this.unsubscribeFromWidgetEvents();
        }
        if (this.unsubscribeFromKeycloakEvent) {
          this.unsubscribeFromKeycloakEvent();
        }
      }
      this.defaultEventHandlerDisabled = disableEventHandler;
    }
  }

  render() {
    const serviceUrl = this.getAttribute(ATTRIBUTES.serviceUrl) || '';
    const attributeConfig = this.getAttribute(ATTRIBUTES.config) || '';
    const config = attributeConfig && JSON.parse(attributeConfig);

    const hidden = this.getAttribute(ATTRIBUTES.hidden) === 'true';
    if (hidden) {
      ReactDOM.render(<></>);
      return;
    }

    const locale = this.getAttribute(ATTRIBUTES.locale);
    setLocale(locale);

    const id = this.getAttribute(ATTRIBUTES.id);

    ReactDOM.render(
      <KeycloakContext.Provider value={this.keycloak}>
        <StylesProvider jss={this.jss}>
          <ThemeProvider theme={this.muiTheme}>
            <NodiDetailsContainer
              id={id}
              onError={this.onError}
              serviceUrl={serviceUrl}
              config={config}
            />
          </ThemeProvider>
        </StylesProvider>
      </KeycloakContext.Provider>,
      this.mountPoint
    );
  }
}
customElements.define('nodi-details', NodiDetailsElement);
