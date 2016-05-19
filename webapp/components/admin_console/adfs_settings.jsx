// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import $ from 'jquery';
import ReactDOM from 'react-dom';
import Client from 'utils/web_client.jsx';
import * as AsyncClient from 'utils/async_client.jsx';

import {injectIntl, intlShape, defineMessages, FormattedMessage, FormattedHTMLMessage} from 'react-intl';

const holders = defineMessages({
    clientIdExample: {
        id: 'admin.adfs.clientIdExample',
        defaultMessage: 'Ex "1dd90126-108e-491d-bb21-128e9cf50519"'
    },
    RelyingPartyIdentifierExample: {
        id: 'admin.adfs.RelyingPartyIdentifier',
        defaultMessage: 'Ex "Https://mattermost.local"'
    },
    authExample: {
        id: 'admin.adfs.authExample',
        defaultMessage: 'Ex "https://adfsserver.local/adfs/oauth2/authorize"'
    },
    tokenExample: {
        id: 'admin.adfs.tokenExample',
        defaultMessage: 'Ex "https://adfsserver.local/adfs/oauth2/token"'
    },
    pubkeyExample: {
        id: 'admin.adfs.pubkeyExample',
        defaultMessage: 'Ex "/home/mmtest/sign.pem"'
    },
    saving: {
        id: 'admin.adfs.saving',
        defaultMessage: 'Saving Config...'
    }
});

import React from 'react';

class ADFSSettings extends React.Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
            Enable: this.props.config.ADFSSettings.Enable,
            saveNeeded: false,
            serverError: null
        };
    }

    handleChange(action) {
        var s = {saveNeeded: true, serverError: this.state.serverError};

        if (action === 'EnableTrue') {
            s.Enable = true;
        }

        if (action === 'EnableFalse') {
            s.Enable = false;
        }

        this.setState(s);
    }

    handleSubmit(e) {
        e.preventDefault();
        $('#save-button').button('loading');

        var config = this.props.config;
        config.ADFSSettings.Enable = ReactDOM.findDOMNode(this.refs.Enable).checked;
        config.ADFSSettings.RelyingPartyIdentifier = ReactDOM.findDOMNode(this.refs.RelyingPartyIdentifier).value.trim();
        config.ADFSSettings.Id = ReactDOM.findDOMNode(this.refs.Id).value.trim();
        config.ADFSSettings.AuthEndpoint = ReactDOM.findDOMNode(this.refs.AuthEndpoint).value.trim();
        config.ADFSSettings.TokenEndpoint = ReactDOM.findDOMNode(this.refs.TokenEndpoint).value.trim();
        config.ADFSSettings.PubKey = ReactDOM.findDOMNode(this.refs.PubKey).value.trim();

        Client.saveConfig(
            config,
            () => {
                AsyncClient.getConfig();
                this.setState({
                    serverError: null,
                    saveNeeded: false
                });
                $('#save-button').button('reset');
            },
            (err) => {
                this.setState({
                    serverError: err.message,
                    saveNeeded: true
                });
                $('#save-button').button('reset');
            }
        );
    }

    render() {
        const {formatMessage} = this.props.intl;
        var serverError = '';
        if (this.state.serverError) {
            serverError = <div className='form-group has-error'><label className='control-label'>{this.state.serverError}</label></div>;
        }

        var saveClass = 'btn';
        if (this.state.saveNeeded) {
            saveClass = 'btn btn-primary';
        }

        return (
            <div className='wrapper--fixed'>

                <h3>
                    <FormattedMessage
                        id='admin.adfs.settingsTitle'
                        defaultMessage='ADFS Settings'
                    />
                </h3>
                <form
                    className='form-horizontal'
                    role='form'
                >

                    <div className='form-group'>
                        <label
                            className='control-label col-sm-4'
                            htmlFor='Enable'
                        >
                            <FormattedMessage
                                id='admin.adfs.enableTitle'
                                defaultMessage='Enable Sign Up With ADFS: '
                            />
                        </label>
                        <div className='col-sm-8'>
                            <label className='radio-inline'>
                                <input
                                    type='radio'
                                    name='Enable'
                                    value='true'
                                    ref='Enable'
                                    defaultChecked={this.props.config.ADFSSettings.Enable}
                                    onChange={this.handleChange.bind(this, 'EnableTrue')}
                                />
                                    <FormattedMessage
                                        id='admin.adfs.true'
                                        defaultMessage='true'
                                    />
                            </label>
                            <label className='radio-inline'>
                                <input
                                    type='radio'
                                    name='Enable'
                                    value='false'
                                    defaultChecked={!this.props.config.ADFSSettings.Enable}
                                    onChange={this.handleChange.bind(this, 'EnableFalse')}
                                />
                                    <FormattedMessage
                                        id='admin.adfs.false'
                                        defaultMessage='false'
                                    />
                            </label>
                            <p className='help-text'>
                                <FormattedMessage
                                    id='admin.adfs.enableDescription'
                                    defaultMessage='When true, Mattermost allows team creation and account signup using ADFS OAuth2.'
                                />
                                <br/>
                            </p>
                            <div className='help-text'>
                                <FormattedHTMLMessage
                                    id='admin.adfs.EnableHtmlDesc'
                                    defaultMessage='You Will need to setup your ADFS 3.0 server to accepted OAUTH2 with redirect url: <your-mattermost-url>/signup/adfs/complete/ <br>For a guide you can visit: http://www.gi-architects.co.uk/2016/04/enable-adfs-oauth2-for-mattermost-2-1'
                                />
                            </div>
                        </div>
                    </div>

                    <div className='form-group'>
                        <label
                            className='control-label col-sm-4'
                            htmlFor='Id'
                        >
                            <FormattedMessage
                                id='admin.adfs.clientIdTitle'
                                defaultMessage='Id:'
                            />
                        </label>
                        <div className='col-sm-8'>
                            <input
                                type='text'
                                className='form-control'
                                id='Id'
                                ref='Id'
                                placeholder={formatMessage(holders.clientIdExample)}
                                defaultValue={this.props.config.ADFSSettings.Id}
                                onChange={this.handleChange}
                                disabled={!this.state.Enable}
                            />
                            <p className='help-text'>
                                <FormattedMessage
                                    id='admin.adfs.clientIdDescription'
                                    defaultMessage='This is the same guid you generated for Mattermost in ADFS'
                                />
                            </p>
                        </div>
                    </div>

                    <div className='form-group'>
                        <label
                            className='control-label col-sm-4'
                            htmlFor='RelyingPartyIdentifier'
                        >
                            <FormattedMessage
                                id='admin.adfs.RelyingPartyIdentifierTitle'
                                defaultMessage='Relying Party Identifier:'
                            />
                        </label>
                        <div className='col-sm-8'>
                            <input
                                type='text'
                                className='form-control'
                                id='RelyingPartyIdentifier'
                                ref='RelyingPartyIdentifier'
                                placeholder={formatMessage(holders.RelyingPartyIdentifierExample)}
                                defaultValue={this.props.config.ADFSSettings.RelyingPartyIdentifier}
                                onChange={this.handleChange}
                                disabled={!this.state.Enable}
                            />
                            <p className='help-text'>
                                <FormattedMessage
                                    id='admin.adfs.RelyingPartyIdentifierDescription'
                                    defaultMessage='This is the identifier you set up in adfs when creating a relying party trust for Mattermost'
                                />
                            </p>
                        </div>
                    </div>

                    <div className='form-group'>
                        <label
                            className='control-label col-sm-4'
                            htmlFor='AuthEndpoint'
                        >
                            <FormattedMessage
                                id='admin.adfs.authTitle'
                                defaultMessage='Auth Endpoint:'
                            />
                        </label>
                        <div className='col-sm-8'>
                            <input
                                type='text'
                                className='form-control'
                                id='AuthEndpoint'
                                ref='AuthEndpoint'
                                placeholder={formatMessage(holders.authExample)}
                                defaultValue={this.props.config.ADFSSettings.AuthEndpoint}
                                onChange={this.handleChange}
                                disabled={!this.state.Enable}
                            />
                            <p className='help-text'>
                                <FormattedMessage
                                    id='admin.adfs.authDescription'
                                    defaultMessage='Enter https://<your-adfs-url>/adfs/oauth2/authorize'
                                />
                            </p>
                        </div>
                    </div>

                    <div className='form-group'>
                        <label
                            className='control-label col-sm-4'
                            htmlFor='TokenEndpoint'
                        >
                            <FormattedMessage
                                id='admin.adfs.tokenTitle'
                                defaultMessage='Token Endpoint:'
                            />
                        </label>
                        <div className='col-sm-8'>
                            <input
                                type='text'
                                className='form-control'
                                id='TokenEndpoint'
                                ref='TokenEndpoint'
                                placeholder={formatMessage(holders.tokenExample)}
                                defaultValue={this.props.config.ADFSSettings.TokenEndpoint}
                                onChange={this.handleChange}
                                disabled={!this.state.Enable}
                            />
                            <p className='help-text'>
                                <FormattedMessage
                                    id='admin.adfs.tokenDescription'
                                    defaultMessage='Enter https://<your-adfs-url>/adfs/oauth2/token.'
                                />
                            </p>
                        </div>
                    </div>

                    <div className='form-group'>
                        <label
                            className='control-label col-sm-4'
                            htmlFor='PubKey'
                        >
                            <FormattedMessage
                                id='admin.adfs.pubkeyTitle'
                                defaultMessage='Public Key Location:'
                            />
                        </label>
                        <div className='col-sm-8'>
                            <input
                                type='text'
                                className='form-control'
                                id='PubKey'
                                ref='PubKey'
                                placeholder={formatMessage(holders.pubkeyExample)}
                                defaultValue={this.props.config.ADFSSettings.PubKey}
                                onChange={this.handleChange}
                                disabled={!this.state.Enable}
                            />
                            <p className='help-text'>
                                <FormattedMessage
                                    id='admin.adfs.pubkeyDescription'
                                    defaultMessage='Specify the absolute location of the public key from the signing certificate in ADFS'
                                />
                            </p>
                        </div>
                    </div>

                    <div className='form-group'>
                        <div className='col-sm-12'>
                            {serverError}
                            <button
                                disabled={!this.state.saveNeeded}
                                type='submit'
                                className={saveClass}
                                onClick={this.handleSubmit}
                                id='save-button'
                                data-loading-text={'<span class=\'glyphicon glyphicon-refresh glyphicon-refresh-animate\'></span> ' + formatMessage(holders.saving)}
                            >
                                <FormattedMessage
                                    id='admin.adfs.save'
                                    defaultMessage='Save'
                                />
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        );
    }
}

ADFSSettings.propTypes = {
    intl: intlShape.isRequired,
    config: React.PropTypes.object
};

export default injectIntl(ADFSSettings);
