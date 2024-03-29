import React, { useState, useEffect, useContext } from "react";
import { Col, Row, Spinner, Container } from "react-bootstrap";
import axios from "axios";
import SelectionPanel from "./selection_panel";
import ProjectIssueGraph from "./project_issue_graph";
import MultiChoiceGraph from "../multi_choice_graph";
import ResponsePhotos from "../gallery/response_photos";
import IssuePhotos from "../gallery/issue_photos";
import IssueModal from "./issue_modal";
import { Waypoint } from "react-waypoint";
import translate from "../../helpers/translate";
import { AppContext } from "../../context";

let host;
//host = "https://field-backend.truefootprint.com";
host = "http://localhost:3000";

function ChartListing({ handleGenerateReport, data, spinner, rerender, showResponsePhotos, setShowResponsePhotos, showIssuePhotos, setShowIssuePhotos }) {
  const [select_id, setSelectedId] = useState(0);

  const handleClose = () => setSelectedId(0);
  const handleShow = (id) => setSelectedId(id);

  const [test, setTest] = useState(false);
  const [showWayPoint, setShowWayPoint] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);

  const [photos, setPhotos] = useState([]);
  const [photosCount, setPhotosCount] = useState(0);
  const [issuePhotos, setIssuePhotos] = useState([]);
  const [issuePhotosCount, setIssuePhotosCount] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [projects, setProjects] = useState([]);
  const { userInterfaceText, setUserInterfaceText } = useContext(AppContext);

  const [selectedValues, setSelectedValues] = useState({
    project_id: "",
    programme_id: "",
    startDate: new Date(),
    endDate: new Date(),
  });

  useEffect(() => {
    axios
      .get(`${host}/reports/setup_report_form`, {
        headers: {
          Authorization: `Basic ${localStorage.getItem("token")}`,
          "Accept-Language": `${localStorage.getItem("locale")}`,
        },
      })
      .then((res) => {        
        setProgrammes(
          res.data.programmes.sort((a, b) => a.name.localeCompare(b.name))
        );
        setUserInterfaceText(res.data.user_interface_text);
      })
      .catch((err) => {
        console.log(err);
      });
    document.getElementById("start-date-select").value = "2020-06-01";
    document.getElementById("end-date-select").value = new Date()
      .toISOString()
      .slice(0, 10);
  }, [rerender]); // END OF USE EFFECT FOR INTIAL LOAD

  function selectProjectHandler(event) {
    console.log("Set project id");
    console.log(event.target.value);
    setSelectedValues({ ...selectedValues, project_id: event.target.value });
  }

  function selectProgrammeHandler(event) {
    setSelectedValues({ ...selectedValues, programme_id: event.target.value });
    // get all projects for this programme selected
    axios
      .get(`${host}/reports/get_projects_list/${event.target.value}`, {
        headers: {
          Authorization: `Basic ${localStorage.getItem("token")}`,
          "Accept-Language": `${localStorage.getItem("locale")}`,
        },
      })
      .then((res) => {
        setProjects(
          res.data.projects.sort((a, b) => a.name.localeCompare(b.name))
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function requestIntialImages(offset, limit, whichPage) {
    console.log("-----requestINTIALIMAGES-----");
    setLoadingImages(true);
    let request = {
      project_id: document.getElementById("project-select").value,
      programme_id: document.getElementById("programme-select").value,
      startDate: document.getElementById("start-date-select").value,
      endDate: document.getElementById("end-date-select").value,
      offset: offset,
      limit: limit,
      whichPage: whichPage,
    };
    axios
      .get(`${host}/reports/photos`, {
        headers: {
          Authorization: `Basic ${localStorage.getItem("token")}`,
          "Accept-Language": `${localStorage.getItem("locale")}`,
        },
        params: request,
      })
      .then((res) => {
        setLoadingImages(false);
        if (whichPage == "responses" && res.data.photos_count != 0) {
          setShowResponsePhotos(true);
          setPhotosCount(res.data.photos_count);
          setPhotos(res.data.photos);
        } else if (whichPage == "issues" && res.data.issue_photos_count != 0){
          setShowIssuePhotos(true);
          setIssuePhotosCount(res.data.issue_photos_count);
          setIssuePhotos(res.data.issue_photos);
        }        
      });
  }

  function requestNextImages(offset, limit, whichPage) {
    console.log("-----requestNextImages-----");
    let request = {
      project_id: document.getElementById("project-select").value,
      programme_id: document.getElementById("programme-select").value,
      startDate: document.getElementById("start-date-select").value,
      endDate: document.getElementById("end-date-select").value,
      offset: offset,
      limit: limit,
      whichPage: whichPage,
    };
    axios
      .get(`${host}/reports/photos`, {
        headers: {
          Authorization: `Basic ${localStorage.getItem("token")}`,
          "Accept-Language": `${localStorage.getItem("locale")}`,
        },
        params: request,
      })
      .then((res) => {
        console.log("WHATS IN MY RES?");
        console.log(res);
        console.log(whichPage);
        if (whichPage == "responses") {
          setPhotos(res.data.photos);
        } else {
          setIssuePhotos(res.data.issue_photos);
        }
      });
  }

  const options = {
    scales: { xAxes: [{ ticks: { beginAtZero: true, precision: 0 } }] },
  };

  return (
    <div>
      <SelectionPanel
        programmes={programmes}
        projects={projects}
        selectProgrammeHandler={selectProgrammeHandler}
        selectProjectHandler={selectProjectHandler}
        handleGenerateReport={handleGenerateReport}
      />
      <Row>
        <Col>
          <h3>
            {data && data.activity
              ? `${translate("report_programme_name_label", userInterfaceText)}: ${data.programme_name}, ${translate("report_project_name_label", userInterfaceText)}: ${data.project_name}`
              : ""}
          </h3>
        </Col>
      </Row>
      <br />
      {spinner && (
        <Row>
          <br />
          <br />
          <Col md={{ span: 3, offset: 5 }}>
            <Spinner animation="border" variant="primary" />
            &nbsp;
          </Col>
        </Row>
      )}
      {data && data.activity && (
        <div>
          <ProjectIssueGraph
            renderIf={data && data.project_issues}
            handleShow={handleShow}
            data={data}
            options={options}
          />
          {data.activity
            .sort((a, b) => (a.activity_order > b.activity_order ? 1 : -1))
            .map((project_activity, index) => {
              return (
                <MultiChoiceGraph
                  key={project_activity.project_activity_name}
                  project_activity={project_activity}
                />
              );
            })}
          {loadingImages && (
            <Row>
              <br />
              <br />
              <Col md={{ span: 3, offset: 5 }}>
                <Spinner animation="border" variant="primary" />
                &nbsp;
              </Col>
            </Row>
          )}
          <Container fluid>
            <Row>
              {showResponsePhotos && data && photos && (
                <ResponsePhotos
                  photos={photos}
                  photosCount={photosCount}
                  requestNextImages={requestNextImages}
                />
              )}
              {showIssuePhotos && data && issuePhotos && (
                <IssuePhotos
                  issuePhotos={issuePhotos}
                  issuePhotosCount={issuePhotosCount}
                  requestNextImages={requestNextImages}
                />
              )}
            </Row>
          </Container>
        </div>
      )}
      {data && data.project_issues && (
        <IssueModal
          select_id={select_id}
          handleClose={handleClose}
          data={data}
        />
      )}
      {data && data.activity && (
        <Waypoint
          scrollableAncestor={window}
          topOffset={"96%"}
          onEnter={function (props) {
            console.log("INSIDE")
            console.log(issuePhotos)
            // Fetch images
            if (!showIssuePhotos && (issuePhotos.length === 0) ) {              
              requestIntialImages(0, 10, "issues");
            }

            if (!showResponsePhotos && (photos.length === 0) ) {              
              requestIntialImages(0, 10, "responses");
            }

            
          }}
        />
      )}
    </div>
  );
}

export default ChartListing;
