package captcha

import (
	"encoding/json"
	"net/http"
	"net/url"
	"strings"
)

type RecaptchaVerifier struct{ Secret string }

type response struct {
	Success bool `json:"success"`
}

func (r RecaptchaVerifier) Verify(token string, ip string) bool {
	// En desarrollo permite vacío si no configuraste secreto.
	if strings.TrimSpace(r.Secret) == "" {
		return true
	}
	if strings.TrimSpace(token) == "" {
		return false
	}
	form := url.Values{}
	form.Set("secret", r.Secret)
	form.Set("response", token)
	form.Set("remoteip", ip)
	resp, err := http.PostForm("https://www.google.com/recaptcha/api/siteverify", form)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	var out response
	return json.NewDecoder(resp.Body).Decode(&out) == nil && out.Success
}
