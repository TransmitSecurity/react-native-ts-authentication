export interface AccessTokenResponse {
    token: string;
    expireDate: Date;
}

class MockServer {

    private baseurl: string;
    private clientId: string;
    private secret: string;

    constructor(baseUrl: string, clientId: string, secret: string) {
        this.baseurl = baseUrl;
        this.clientId = clientId;
        this.secret = secret;
    }

    public completeAuthentication = async (accessToken: string, webAuthnEncodedResult: string): Promise<boolean> => {
        const formData = {
            "webauthn_encoded_result": webAuthnEncodedResult
        };
        
        try {
          const resp = await fetch(
              `${this.baseurl}/cis/v1/auth/webauthn/authenticate`,
              {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/x-www-form-urlencoded',
                      Authorization: `Bearer ${accessToken}`
                  },
                  body: new URLSearchParams(formData).toString()
              }
          );

          console.log(resp)
          return resp.status === 200;

      } catch (error) {
          return Promise.reject(`Error in completeAuthentication: ${error}`);
      }
    }

    public completeRegistration = async (accessToken: string, webAuthnEncodedResult: string, externalUserId : string): Promise<boolean> => {
        const formData = {
            "webauthn_encoded_result": webAuthnEncodedResult,
            "external_user_id": externalUserId
        };
        
        try {
          const resp = await fetch(
              `${this.baseurl}/cis/v1/auth/webauthn/external/register`,
              {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/x-www-form-urlencoded',
                      Authorization: `Bearer ${accessToken}`
                  },
                  body: new URLSearchParams(formData).toString()
              }
          );

          return resp.status === 200;

      } catch (error) {
        return Promise.reject(`Error in completeRegistration: ${error}`);
      }
    }

    public getAccessToken = async (): Promise<AccessTokenResponse> => {
        const formData = {
            client_id: this.clientId,
            client_secret: this.secret,
            grant_type: 'client_credentials',
        };

        try {
            const resp = await fetch(
                `${this.baseurl}/oidc/token`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams(formData).toString()
                }
            );

            const json = await resp.json();
            const expireDate = new Date();
            expireDate.setSeconds(expireDate.getSeconds() + json.expires_in);
            return { token: json.access_token, expireDate };
        } catch (error) {
            return Promise.reject(`Error in getAccessToken: ${error}`);
        }
    }
}
export default MockServer;