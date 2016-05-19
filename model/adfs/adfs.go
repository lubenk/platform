// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

package oauthadfs

import (
	"encoding/json"
	"github.com/mattermost/platform/einterfaces"
	"github.com/mattermost/platform/model"
	"io"
	"strings"
)

const (
	USER_AUTH_SERVICE_ADFS = "adfs"
)

type ADFSProvider struct {
}

type ADFSUser struct {
	Id        string `json:"primarysid"`
	FirstName string `json:"given_name"`
	LastName  string `json:"family_name"`
	Email     string `json:"email"`
	Username  string `json:"upn"`
}

func init() {
	provider := &ADFSProvider{}
	einterfaces.RegisterOauthProvider(USER_AUTH_SERVICE_ADFS, provider)
}

func userFromADFSUser(glu *ADFSUser) *model.User {
	user := &model.User{}
	s := strings.Split(glu.Username, "@")
	user.Username = s[0]
	user.FirstName = glu.FirstName
	user.LastName = glu.LastName
	user.Email = glu.Email
	user.AuthData = &glu.Id
	user.AuthService = USER_AUTH_SERVICE_ADFS

	return user
}

func ADFSUserFromJson(data io.Reader) *ADFSUser {
	decoder := json.NewDecoder(data)
	var glu ADFSUser
	err := decoder.Decode(&glu)
	if err == nil {
		return &glu
	} else {
		return nil
	}
}

func (glu *ADFSUser) IsValid() bool {
	if len(glu.Id) == 0 {
		return false
	}

	if len(glu.Email) == 0 {
		return false
	}

	return true
}

func (glu *ADFSUser) getAuthData() string {
	return glu.Id
}

func (m *ADFSProvider) GetIdentifier() string {
	return USER_AUTH_SERVICE_ADFS
}

func (m *ADFSProvider) GetUserFromJson(data io.Reader) *model.User {
	glu := ADFSUserFromJson(data)
	if glu.IsValid() {
		return userFromADFSUser(glu)
	}

	return &model.User{}
}

func (m *ADFSProvider) GetAuthDataFromJson(data io.Reader) string {
	glu := ADFSUserFromJson(data)

	if glu.IsValid() {
		return glu.getAuthData()
	}

	return ""
}
