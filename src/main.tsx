import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as SuperAgent from 'superagent';
import * as config from './config';

interface ImageFormProps {
}
interface ImageFormState {
  image_src: string;
  textarea_value: string;
  header: string;
}

class ImageForm extends React.Component<ImageFormProps, ImageFormState> {
  constructor(props) {
    super(props);
    this.state = { image_src: '', textarea_value: '', header: '画像のURLを入力して下さい' };
    this.handleChangeFile = this.handleChangeFile.bind(this);
    this.handleChangeURL = this.handleChangeURL.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChangeFile(event) {
    var files = event.target.files;
    this.setState({image_src: window.URL.createObjectURL(files[0])});

    this.submitImage(files[0], 'application/octet-stream');
  }
  handleChangeURL(event){
    this.setState({image_src: event.target.value});
  }
  handleSubmit(event) {
    this.submitImage({url:this.state.image_src}, 'application/json');
  }
  submitImage(image, content_type:string) {
    this.setState({header: "(解析しています...)", textarea_value:''});
    SuperAgent
      .post(config.computer_vision.api_url)
      .set('Ocp-Apim-Subscription-Key', config.computer_vision.api_key)
      .set('Content-Type', content_type)
      .send(image)
      .end(function(error, response){
        if (error) { return this.setState({header: response.text}); }
        var desc = JSON.parse(response.text).description.captions[0].text;

        this.setState({header: `(翻訳APIのアクセストークンを取得しています...)`});
        SuperAgent
          .post(config.translator_text.issue_token_url)
          .set('Content-Type', 'application/json')
          .set('Accept', 'application/jwt')
          .set('Ocp-Apim-Subscription-Key', config.translator_text.api_key)
          .send()
          .end(function(error, response_token){
            if (error) { return this.setState({header: response_token.text}); }
            var token = response_token.text;
            this.setState({header: `(「${desc}」を翻訳しています...)`});

            SuperAgent
              .get(config.translator_text.api_url)
              .query({
                'appid': 'Bearer ' + token,
                'text': desc,
                'to': 'ja',})
              .set('Accept', 'application/xml')
              .end(function(error, response_trans){
                if (error) { return this.setState({textarea_value: response_trans.text}); }
                var parser = new DOMParser();
                desc = parser.parseFromString(response_trans.text, 'text/xml').firstElementChild.textContent;

                this.setState({header: desc, textarea_value: `<img alt="${desc}" src="${this.state.image_src}">`});
              }.bind(this));
          }.bind(this));
      }.bind(this));
  }
  render() {
    return (
      <div>
        <h1>{this.state.header}</h1>
        <form>
          <input type="file" ref="file" onChange={this.handleChangeFile} />
          <input
            type="url" placeholder="http://www.example.com/" size={40}
            onBlur={this.handleChangeURL}
          />
          <input value="URL上の画像を解析" type="button" onClick={this.handleSubmit} />
        </form>
        <textarea
          placeholder="ここにimgタグが出力されます" rows={5} cols={40}
          value={this.state.textarea_value}
        />
        <img src={this.state.image_src} width="100%" />
      </div>
    );
  }
}

ReactDOM.render(<ImageForm />, document.querySelector('#app'));
