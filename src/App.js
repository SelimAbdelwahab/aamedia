import React, { useRef, Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, OrbitControls } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { Material, MeshBasicMaterial } from 'three';
import { useMemo } from 'react';
import * as THREE from "three";
import "./App.css"
import overviewLrgImg from "./images/wizard.jpg";

window.scrollTo(0, 0);

document.onload = () => {
  window.location.href = window.location.host;
}

let offers = [];
let elements = document.getElementsByTagName("*");

const NUM_OFFERS = 6;
const RADIUS = 20;

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

function assignOfferProps(setOfferProps, offset) {
  let seperationAngle = 2 * Math.PI / NUM_OFFERS;
  let props = [];

  for (var i = 0; i < NUM_OFFERS; i++) {
    props.push({
      pos: new THREE.Vector3(RADIUS * Math.sin((i + offset) * seperationAngle), -0.5, RADIUS * Math.cos((i + offset) * seperationAngle) - RADIUS / 1.2),
      rotation: new THREE.Euler(Math.PI / 2, 0, (i + offset) * seperationAngle),
      angle: (i + offset) * seperationAngle
    });
  }


  setOfferProps(props);
}

let prevDeltaY = 0;

let offerAniProps = {
  enteredCycle: false,
  completedCycle: false,
  inAni: false,
  hovered: false,
  active: 0,
  direction: 1,
  allowStart: false,
  forceRecolor: false
}

let focusAniProps = {
  enteredCycle: false,
  completedCycle: false,
  offset: -WIDTH
}

export default function App() {
  let overviewRef = useRef(<p />);
  let focusRef = useRef(<p />);
  offers = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  let canvasRef = useRef();
  let footerRef = useRef();

  const [offerProps, setOfferProps] = useState(Array.from({ length: 6 }, (_, i) => ({
    pos: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(Math.PI / 2, 0, 0),
    angle: 0
  })));

  const showElements = () => {
    for (var i = 0; i < elements.length; i++) {
      let elem = elements.item(i);
      let rect = elem.getBoundingClientRect();

      if (rect.top < HEIGHT / 2) {
        if (elem.id === "focus-container") {
          focusAniProps.enteredCycle = true;
          focusRef.current.style.backgroundPositionX = (-focusRef.current.getBoundingClientRect().width).toString() + "px";
        } else if (elem.id === 'scene') {
          offerAniProps.enteredCycle = true;
          setTimeout(() => {
            offerAniProps.allowStart = true;
          }, 1000);
        } else if (focusAniProps.enteredCycle && !focusAniProps.completedCycle) {
          return;
        }

        if (elem.classList.contains("all-at-once")) {
          let children = elem.children;

          for (var j = 0; j < children.length; j++) {
            let child = children.item(j);
            let delay = child.style.getPropertyValue('--delay');

            if (delay) {
              setTimeout(() => {
                if (child.classList.contains('appear-left')) {
                  child.classList.add("start-up-ani-left");
                } else if (child.classList.contains('appear-right')) {
                  child.classList.add("start-up-ani-right");
                }

                child.classList.remove("hidden");
              }, delay)
            } else {
              if (elem.classList.contains('appear-left')) {
                elem.classList.add("start-up-ani-left");
              } else if (elem.classList.contains('appear-right')) {
                elem.classList.add("start-up-ani-right");
              }

              elem.classList.remove("hidden");
            }
          }
        }

        let delay = elem.style.getPropertyValue('--delay');

        if (delay) {
          setTimeout(() => {
            if (elem.classList.contains('appear-left')) {
              elem.classList.add("start-up-ani-left");
            } else if (elem.classList.contains('appear-right')) {
              elem.classList.add("start-up-ani-right");
            }

            elem.classList.remove("hidden");
          }, delay)
        } else {
          if (elem.classList.contains('appear-left')) {
            elem.classList.add("start-up-ani-left");
          } else if (elem.classList.contains('appear-right')) {
            elem.classList.add("start-up-ani-right");
          }

          elem.classList.remove("hidden");
        }
      }
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0);
    // Get list of elements to add initial animation class name
    elements = document.body.getElementsByTagName("*");

    assignOfferProps(setOfferProps, offerAniProps.active);

    window.addEventListener("wheel", (wheelProperties) => {
      if (offerAniProps.enteredCycle && !offerAniProps.completedCycle) {
        // Checks to see if the user is scrolling down the page
        if (wheelProperties.deltaY > 0) {
          offerAniProps.inAni = true;
          offerAniProps.direction = 1;
        } else if (wheelProperties.deltaY < 0 && offerAniProps.active !== 0) {
          offerAniProps.inAni = true;
          offerAniProps.direction = -1;
        }
      } else {
        window.scrollBy(0, wheelProperties.deltaY);
      }

      prevDeltaY = wheelProperties.deltaY;
    })

    function stickynavbar() {
      let navbar = document.querySelector('#nav');
      let companyContainer = document.querySelector('#company-info-container')
      let companyName = document.querySelector('#company-name');
      let top = navbar.offsetTop;

      if (window.scrollY > top) {
        navbar.classList.add('sticky');
        companyContainer.classList.add("shift");
        companyName.classList.remove("hide");

        overviewRef.current.style.marginTop = navbar.getBoundingClientRect().height + "px";

        //window.removeEventListener('scroll', stickynavbar)
      } else {
        navbar.classList.remove('sticky');
        companyContainer.classList.remove("shift");
        companyName.classList.add("hide");

        overviewRef.current.style.marginTop = 0 + "px";
      }
    }

    window.addEventListener('scroll', stickynavbar);

    window.addEventListener('scroll', showElements);

    for (var i = 0; i < elements.length; i++) {
      let elem = elements.item(i);
      if (!elem.classList.contains("movable"))
        continue;

      let rect = elem.getBoundingClientRect();

      if (rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= HEIGHT &&
        rect.right <= WIDTH) {
        if (rect.x < WIDTH / 2)
          elem.classList.add("start-up-ani-left");
        else {
          elem.classList.add("start-up-ani-right");
        }
      }
    };
  }, [])

  return (
    <div className='App ignore' ref={overviewRef}>
      <div className="section">
        <div className="header ignore">
          <h1 id='overview-info-header' className='movable'>
            AA Media
          </h1>

          <a className='start-up-ani-right' href="#meeting-section"><button id='book-now' onClick={() => {
            offerAniProps.enteredCycle = true;
            offerAniProps.completedCycle = true;
            offerAniProps.active = 1;
            offerAniProps.forceRecolor = true;

            for (var i = 0; i < elements.length; i++) {
              let elem = elements.item(i);
              elem.classList.remove("hidden")
            }

          }} onMouseEnter={(e) => {
            e.currentTarget.classList.add("bg-slide")
          }} onMouseLeave={(e) => {
            e.currentTarget.classList.remove('bg-slide');
          }}>Book Now</button></a>
        </div>
      </div>


      <div className="section" style={{ backgroundColor: 'white' }}>
        <div className="overview-container">
          <div id="overview-info">

            <h2 className="attraction-text movable">
              We Help Businesses Produce Spine-Chilling ROI Via Paid Advertising
            </h2>
            <h3 className='movable'>
              Stop wasting time and money on faulty and ineffective ad campaigns.
            </h3>
            <h3 className='movable'>
              It's time to make your ad-budget count, scale your business and blow up your sales.
            </h3>
          </div>
          <img className="fill-img movable" alt="" srcset={overviewLrgImg} />
        </div>
      </div>

      <svg className="shape-divider" aria-hidden="true" fill="black" xmlns="http://www.w3.org/2000/svg" viewBox='0 0 100 3' preserveAspectRatio="none" style={{ backgroundColor: 'white' }}>
        <path d='M 0 3 C 36 -2 13 4 50 2 C 68 -1 62 4 82 1 C 90 -1 112 1 100 3'></path>
      </svg>

      <div className="seperator" style={{ height: "10vh", background: "black" }}>

      </div>

      <div className="section" style={{ "background": "black" }}>
        <div id="mastery-intro">
          <h1 className='hidden transition-x' style={{ '--transition': '2s' }}>Mastery Demands</h1>
          <br />
          <div id='focus-container' className="focus-container hidden transition-x" style={{ '--transition': '2s' }}>
            <div className="filler">
            </div>

            <div id='focus-wrapper' className="focus-wrapper" style={{ "--offset": (-WIDTH).toString() + "px" }} ref={focusRef}>
              <h1>F</h1>
              <h1>o</h1>
              <h1>c</h1>
              <h1>u</h1>
              <h1>s</h1>
            </div>

            <div className="filler">
            </div>
          </div>
        </div>
        <div className="mastery-body-container">
          <h4 id="mastery-b1" className='hidden transition-x appear-left' style={{ '--transition': '2s' }}>
            If you want an agency that offers a full-service solution of everything that won’t move the needle forward, we’re not for you.
          </h4>
          <h4 id="mastery-b2" className='hidden transition-x appear-right' style={{ '--transition': '2s' }}>
            If you want an agency where with two clicks, you can get a clear breakdown of how much was spent, how much was made & what your net profit was - we’re for you.
          </h4>
        </div>

      </div>

      <div className="seperator" style={{ height: "10vh", background: "black" }}>

      </div>

      <svg className="shape-divider" aria-hidden="true" fill="black" xmlns="http://www.w3.org/2000/svg" viewBox='0 0 100 5' preserveAspectRatio="none" style={{ zIndex: 1000, backgroundColor: 'white' }}>
        <path d="M 0 0 C 4.301 5.594 13.241 -0.086 17.974 5.173 C 26.824 -3.429 18.397 8.317 30.776 3.2 C 31.284 -3.359 39.441 6.997 51.325 4.191 C 89.781 -2.659 54.625 6.419 86.727 2.706 C 100.096 1.798 110.247 9.06 100 0 Z"></path>

      </svg>

      <div className="section" style={{ "background": "white" }}>
        <div className="offer-container hidden transition-x" style={{ '--transition': '2s' }}>
          <h1 className='attraction-text'>Scroll To See What We Offer</h1>
          <div className="scene-container">
            <Canvas id='scene' className='scene' ref={canvasRef}>
              {/* <Suspense fallback={null}> */}

              <Text num={0} setOfferProps={setOfferProps} offerProps={offerProps} data={offerProps[0]} path="texts/offer1.obj" focusRef={focusRef} all={offers} />
              <Text num={1} setOfferProps={setOfferProps} offerProps={offerProps} data={offerProps[1]} path="texts/offer2.obj" focusRef={focusRef} all={offers} />
              <Text num={2} setOfferProps={setOfferProps} offerProps={offerProps} data={offerProps[2]} path="texts/offer3.obj" focusRef={focusRef} all={offers} />
              <Text num={3} setOfferProps={setOfferProps} offerProps={offerProps} data={offerProps[3]} path="texts/offer4.obj" focusRef={focusRef} all={offers} />
              <Text num={4} setOfferProps={setOfferProps} offerProps={offerProps} data={offerProps[4]} path="texts/offer5.obj" focusRef={focusRef} all={offers} />
              <Text num={5} setOfferProps={setOfferProps} offerProps={offerProps} data={offerProps[5]} path="texts/offer6.obj" focusRef={focusRef} all={offers} />

              {/* </Suspense> */}
            </Canvas>
          </div>
        </div>
      </div>


      {/* <svg className="shape-divider" aria-hidden="true" fill="white" xmlns="http://www.w3.org/2000/svg" viewBox='0 0 100 5' preserveAspectRatio="none">
        <path d="M 0 0 C 8.881 11.717 0.546 -2.461 10.17 3.382 C 22.714 0.976 18.397 8.317 25.464 3.038 C 45.828 3.984 24.948 -2.804 51.325 4.191 C 36.204 -4.093 74.182 8.366 89.39 0.977 C 97.553 -1.343 82.344 8.624 100 0 Z"></path>
      </svg> */}

      <div id='meeting-section' className="section" style={{ backgroundColor: "white" }}>
        <div id='meeting-container'>
          <div className="meeting-info">
            <div className='hidden transition-x' style={{ '--transition': '2s' }}>
              <h1 className="attraction-text">
                Free 30-Minute Consultation
              </h1>

              <p className='tab-x' style={{ '--tab': '4vw' }}>
                By the end of this Consultation call, you will have a clear understanding of the next steps you can take for your business to start generating consistent and reliable results online with Funnels & Paid Advertising.
              </p>

              <div className="seperator" style={{ height: "10vh", background: "white" }}></div>

              <h6 className='tab-x' style={{ '--tab': '4vw' }}>
                Find a time on our calendar to schedule your call today and we look forward to speaking to you soon!
              </h6>
            </div>


            <div className='hidden transition-x' style={{ '--transition': '2s' }}>
              <h2 className='attraction-text' id='show-footer'>
                THIS CONSULTATION CALL IS PERFECT FOR:
              </h2>

              <ul className='tab-x all-at-once' style={{ '--tab': '4vw' }}>
                <li className='hidden appear-left transition-x ignore' style={{ '--transition': '2s' }}>
                  <p>
                    Businesses looking to convert their current website into <span className='bold attraction-text'>high-quality & streamlined funnel format.</span>
                  </p>
                </li>
                <li className='hidden appear-left transition-x features-li ignore' style={{ '--transition': '3s', '--delay': 1000 }}>
                  <p>
                    Businesses looking to take their offline business <span className='bold attraction-text'>online.</span>
                  </p>
                </li>
                <li className='hidden appear-left transition-x features-li ignore' style={{ '--transition': '4s', '--delay': 2000 }}>
                  <p>
                    Businesses looking to understand their <span className='bold attraction-text'>increased revenue potential with funnels & conversion rate optimization.</span>
                  </p>
                </li>
                <li className='hidden appear-left transition-x features-li ignore' style={{ '--transition': '5s', '--delay': 3000 }}>
                  <p>
                    Businesses looking to <span className='bold attraction-text'>maximize their conversion rates</span> & <span className='bold attraction-text'>average order value.</span>
                  </p>
                </li>
                <li className='hidden appear-left transition-x features-li ignore' style={{ '--transition': '6s', '--delay': 4000 }}>
                  <p>
                    Businesses looking for a reliable agency that can <span className='bold attraction-text'>make their company a priority.</span>
                  </p>
                </li>
              </ul>
            </div>
          </div>

          <iframe className='hidden appear-right' id='calender' title='calender-schedule' src="https://calendly.com/aamedia1/30min" frameborder="0"></iframe>
        </div>
        <div className="seperator" style={{ height: "10vh", background: "white" }}>

        </div>
      </div>

      <div className="footer" ref={footerRef}>
        <h1>Have a general inquiry?</h1>
        <p>
          If you have a general inquiry and would like to speak to our expert team, <br />
          you can contact us via email at: <a href='mailto:marketing@doubleamedia.org'>marketing@doubleamedia.org</a>
        </p>
      </div>
    </div>
  )
}

function Text(props) {
  const ref = useRef();
  let thing = props.offerProps[props.num];

  offers[props.num] = ref;

  const BasicMaterial = new MeshBasicMaterial({ color: new THREE.Color("#000000") });
  const SuccessMaterial = new MeshBasicMaterial({ color: new THREE.Color("#9900FF") });

  const obj = useLoader(OBJLoader, props.path);
  let model = useMemo(() => obj.clone(true), [obj]);
  model.children.forEach((mesh, _) => { mesh.material = BasicMaterial; });

  props.all[props.num] = model;

  useFrame((_, delta) => {

    let auto = offerAniProps.completedCycle;

    if (offerAniProps.forceRecolor) {
      offerAniProps.enteredCycle = false;
      offerAniProps.completedCycle = true;

      props.all.forEach(model => {
        model.children.forEach((mesh, _) => { mesh.material = SuccessMaterial; });
      })

      offerAniProps.forceRecolor = false;
    }

    let speed = 1;

    if (auto) {
      speed = 0.4;
    }

    if ((offerAniProps.inAni || auto) && offerAniProps.allowStart) {

      if (offerAniProps.direction === -1 && offerAniProps.active === 0) {
        return;
      }

      let angle = thing.angle + 0.5 * delta * speed * offerAniProps.direction;

      if (angle > Math.PI * 2)
        angle -= Math.PI * 2;

      ref.current.position.set(RADIUS * Math.sin(angle), -0.5, RADIUS * Math.cos(angle) - RADIUS / 1.2);
      ref.current.rotation.set(Math.PI / 2, 0, angle);
      props.offerProps[props.num].angle = angle


      if (!auto && Math.abs(props.offerProps[props.num].angle) < 0.01 && offerAniProps.active !== props.num) {
        offerAniProps.inAni = false;
        offerAniProps.active = props.num;

        //assignOfferProps(props.setOfferProps, -offerAniProps.active);

        if (offerAniProps.active === 1) {
          offerAniProps.enteredCycle = false;
          offerAniProps.completedCycle = true;

          props.all.forEach(model => {
            model.children.forEach((mesh, _) => { mesh.material = SuccessMaterial; });
          })
        }
      }
    }

    if (focusAniProps.enteredCycle && !focusAniProps.completedCycle) {
      if (focusAniProps.offset < 0) {
        focusAniProps.offset += 180 * delta;

        props.focusRef.current.style.backgroundPositionX = focusAniProps.offset + "px";

        let childs = props.focusRef.current.children;

        for (var i = 0; i < childs.length; i++) {
          let child = childs.item(i);

          if (props.focusRef.current.getBoundingClientRect().width + focusAniProps.offset + WIDTH * 0.10 > child.getBoundingClientRect().left) {
            child.classList.add("attraction-text");
          }
        }
      } else {
        focusAniProps.completedCycle = true;
        document.getElementById("focus-wrapper").style.backgroundColor = 'white';
      }
    }
  });

  return (
    <primitive
      position={props.data.pos}
      rotation={props.data.rotation}
      object={model}
      scale={0.8}
      ref={ref}
      color="red"
    />
  )
}