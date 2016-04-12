// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

package api

import (
	"bytes"
	"encoding/json"
	"errors"
	"github.com/dgrijalva/jwt-go"
	"io"
	"io/ioutil"
)

type AccessResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int32  `json:"expires_in"`
}

func CheckADFSToken(myToken string, pubkey string) (io.ReadCloser, string) {
	key, err := ioutil.ReadFile(pubkey)
	if err != nil {
		return nil, "Error loading certificate file"
	}
	token, err := jwt.Parse(myToken, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, errors.New("Unexpected signing method")
		}
		return key, nil
	})

	if token.Valid {
		m, err := json.Marshal(token.Claims)
		if err != nil {
			return nil, "Failed to Marshal Claim"
		}
		t := bytes.NewReader(m)
		r := ioutil.NopCloser(t)
		return r, ""
	} else if ve, ok := err.(*jwt.ValidationError); ok {
		if ve.Errors&jwt.ValidationErrorMalformed != 0 {
			return nil, "Not a JWT Token"
		} else if ve.Errors&(jwt.ValidationErrorExpired|jwt.ValidationErrorNotValidYet) != 0 {
			return nil, "Token Expired/Not active"
		} else {
			return nil, "Couldn't handle this token"
		}
	} else {
		return nil, "Couldn't handle this token"
	}
}

func AccessResponseFromJsonADFS(data io.Reader, pubkey string) (io.ReadCloser, string, string) {
	buf := new(bytes.Buffer)
	buf.ReadFrom(data)
	var ar AccessResponse
	err := json.Unmarshal(buf.Bytes(), &ar)
	if err == nil && len(ar.AccessToken) != 0 {
		if check, errf := CheckADFSToken(ar.AccessToken, pubkey); len(errf) == 0 && check != nil {
			return check, "AccessResponseFromJsonADFS", ""
		} else {
			return nil, "CheckADFSToken", errf
		}

	} else {
		return nil, "AccessResponseFromJsonADFS", ("Failed to Unmarshal token")
	}
}
