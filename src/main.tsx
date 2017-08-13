import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as SuperAgent from 'superagent';
import * as config from './config';

interface ImageFormProps {
}
interface ImageFormState {
  image_src: string;
  textarea_value: string;
}

class ImageForm extends React.Component<ImageFormProps, ImageFormState> {
  constructor(props) {
    super(props);
    this.state = { image_src: '', textarea_value: '' };
    this.handleChangeFile = this.handleChangeFile.bind(this);
    this.handleChangeURL = this.handleChangeURL.bind(this);
  }
  handleChangeFile(event) {
    var files = event.target.files;
    var image_url = window.URL.createObjectURL(files[0]);
    this.setState({image_src: image_url});
  }
  handleChangeURL(event) {
    var image_url = event.target.value;
    this.setState({image_src: image_url,textarea_value: "(解析しています...)"});
    SuperAgent
      .post(config.api_url)
      .set('Ocp-Apim-Subscription-Key', config.api_key)
      .set('Content-Type', 'application/json')
      .send({url:image_url})
      .end(function(error, response){
        if (error) { return this.setState({textarea_value: response.text}); }
        var desc = JSON.parse(response.text).description.captions[0].text;
        var image_tag = `<img alt="${desc}" src="${image_url}">`;

        this.setState({textarea_value: image_tag});
      }.bind(this));
  }
  render() {
    return (
      <div>
        {/* <input type="file" ref="file" onChange={this.handleChangeFile} /> */}
        <textarea
          placeholder="ここにimgタグが出力されます" rows={5} cols={40}
          value={this.state.textarea_value}
        />
        <input
          type="url" placeholder="http://www.example.com/" size={40}
          onBlur={this.handleChangeURL}
        />
        <img src={this.state.image_src} width="100%" />
      </div>
    );
  }
}

ReactDOM.render(<ImageForm />, document.querySelector('#app'));
