import './App.css';
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from './logo192.png';
import Container from 'react-bootstrap/Container';
import {Collapse, Nav,Navbar,NavDropdown} from 'react-bootstrap';
import {Form,FormGroup} from 'react-bootstrap';
import Stack from 'react-bootstrap/Stack';
import {Button,ButtonGroup} from 'react-bootstrap';
import {Row,Col} from 'react-bootstrap';

var g_post = [
  {
    author: 'Utente 1',
    profile_img: {
      src: 'https://picsum.photos/50/50',
      description: 'Immagine profilo 1',
    },
    img:{
      src: 'https://picsum.photos/300/500',
      description: 'Immagine 1',
    },
    text: null
  }
  ,
  {
    author: 'Utente 2',
    profile_img: {
      src: 'https://picsum.photos/50/50',
      description: 'Immagine profilo 2',
    },
    img:{
      src: 'https://picsum.photos/500/300',
      description: 'Immagine 2',
    },
    text: 'Lorem Lorem Lorem Lorem Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget ultricies ultrices, nunc nisl aliquam nunc, vitae aliquam nisl nunc vitae nisl.'
  },
  {
    author: 'Utente 3',
    profile_img: {
      src: 'https://picsum.photos/50/50',
      description: 'Immagine profilo 3',
    },
    img: null,
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget ultricies ultrices, nunc nisl aliquam nunc, vitae aliquam nisl nunc vitae nisl.'
  }
]

export default function App() {
  return (
    <div className="bg-dark">
      <Row>
        <Col xs={3}><Left_Content/></Col>
        <Col xs={6}><Center_Content/></Col>
        <Col className='' xs={3}><Right_Content/></Col>
      </Row>
    </div>
  );
}

//#region Left_Content

function Left_Content(){
  return(
    <Navbar className='d-flex flex-column align-items-start ps-3' sticky="top">
      <Dark_Button img={logo}/>
      <Dark_Button text='Esplora'/>
      <Dark_Button text='Impostazioni'/>
    </Navbar>
  );
}

function Dark_Button({text=null,img=null}){
  let label;
  if(img!=null){
    label = <img src={img} alt='logo' width='30' height='30'/>
  } else {
    label = <label className='fs-4'>{text}</label>;
  }

  return(
    <Button as='a' className='rounded' variant='dark'>
      {label}
    </Button>
  );
}

//#endregion


//#region Right_Content

function Right_Content(){
  const [open,setOpen] = useState(true);


  return(
    <Navbar className='container-fluid d-flex flex-column' sticky="top">
      <ButtonGroup className='mt-5'>
        <Button onClick={()=>setOpen(!open)}>
          Resistrazione
        </Button>
        <Button onClick={()=>setOpen(!open)}>
          Accesso
        </Button>
      </ButtonGroup>
        
      <Collapse in={open}>
        <Form  className='m-0 me-4 py-3 px-3 border'>
          <Form.Text className='text-light fs-5 text-center text-break'> 
            Iscriviti rapidamente compilando il Form!
          </Form.Text>
          <FormGroup className='mb-3'>
            <Form.Label className='text-light'>Username</Form.Label>
            <Form.Control type='text' placeholder='Inserisci il tuo username'/>
          </FormGroup>
          <FormGroup className='mb-3'>
            <Form.Label className='text-light'>Email</Form.Label>
            <Form.Control type='email' placeholder='Inserisci la tua email'/>
          </FormGroup>
          <FormGroup className='mb-3'>
            <Form.Label className='text-light'>Password</Form.Label>
            <Form.Control type='password' placeholder='Inserisci la tua password'/>
          </FormGroup>
          <Container className='d-flex justify-content-center'>
            <Button className='col-6 me-1' variant='outline-success' type='submit'>Registrati</Button>
            <Button className='col-6' variant='outline-danger' type='reset'>Cancella</Button>
          </Container>
        </Form>
      </Collapse>
    </Navbar>
  );
  
}

//#region Center_Content

function Center_Content(){
  return(
    <Container className = "border-start border-end border-light">
      <Header/>
      <Flow/>
    </Container>
  );
}

function Header(){
  return(
    //Navbar principale
    <Navbar className="container-fluid" bg='dark' variant='dark' expand='sm' sticky='top'>
      <Container className='d-flex flex-row justify-content-center'>
        <Navbar.Brand className=''>Squealer</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav border" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className=''>
            <Nav.Link href='#home'> Esplora </Nav.Link>
            <NavDropdown title='Canali'> 
              <NavDropdown.Item>
                Canale 1
              </NavDropdown.Item>
              <NavDropdown.Item>
                Canale 2
              </NavDropdown.Item>
            </NavDropdown>
            <Form className="">
              <Form.Control
                type='search'
                placeholder='Cerca un Utente'
              />
            </Form>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    
  );
}

function Flow(){
  return(
    <>
      <MakeFeed contents={g_post} />
    </>
  );
}

function Post({author,content}){
  return(
    <Container className='p-3 border-bottom border-light d-flex flex-column d-flex'>
      <Author author={author}/>
      <hr className='text-light'/>
      <Post_Content content={content}/>
    </Container>
  );
}

function Post_Content({content}){
  return(
    <Container className='bg-dark'>
        <Content content={content} isContent={true}/>
    </Container>
  );
}

function Author({author}){
  return(
    <Container className='bg-dark'>
      <Content content={author} isContent={false}/>
    </Container>
  );
}

function Content({content,isContent=true}){

  let img = content.img;

  function Image_C(){
    if(img==null){
      return null;
    }
    return(
      <img src={img.src} className='rounded align-self-center image-fluid' alt={img.description}/>
    );
  }

  function Text_C(){
    if(content.text==null){
      return null;
    }
    return(
      <Container className="container-fluid text-light text-break">{content.text}</Container>
    );
  }

  if(isContent){
    return(
      <Stack className="" gap={3}>
        <Text_C/>
        <Image_C/>
      </Stack>
    );
  } else {
    return(
      <Container className="d-flex align-items-center">
        <Image_C/>
        <Text_C/>
      </Container>
    );
  }
}

function MakeFeed({contents}){
  const Feed = contents.map((content) => {
    return(
      <Post
      author={{text: content.author,img: content.profile_img}} 
      content={{text: content.text,img: content.img}}
      />
    );
  }
  );

  return(
    <Stack xs={6} className="d-flex flex-column-reverse p-1">
      {Feed}
    </Stack>
  );
}

//#endregion
