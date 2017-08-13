import * as React from 'react';
import * as ReactDOM from 'react-dom';

interface ImageFormProps {
}
interface ImageFormState {
  image_src: string;
}

class ImageForm extends React.Component<ImageFormProps, ImageFormState> {
  constructor(props) {
    super(props);
    this.state = { image_src: '' };
    this.handleChangeFile = this.handleChangeFile.bind(this);
  }
  handleChangeFile(event) {
    var files = event.target.files;
    var image_url = window.URL.createObjectURL(files[0]);
    this.setState({image_src: image_url});
  }
  render() {
    return (
      <div>
        <input type="file" ref="file" onChange={this.handleChangeFile} />
        <img src={this.state.image_src} width="100%" />
      </div>
    );
  }
}

ReactDOM.render(<ImageForm />, document.querySelector('#app'));
