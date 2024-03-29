import React, { useState, useContext } from "react";
import translate from "../../helpers/translate";
import { AppContext } from "../../context";
import axios from "axios";
import { Waypoint } from "react-waypoint";
import { HorizontalBar } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import {
  Col,
  Row,
  Spinner,
  Container,
  Form,
  FormControl,
  Modal,
  Button,
  Table,
} from "react-bootstrap";

function MultiChoiceGraph(props) {
  const { userInterfaceText, setUserInterfaceText } = useContext(AppContext);
  console.log("MODAL");
  console.log(userInterfaceText);
  const [select_id, setSelectedId] = useState(0);

  const handleClose = () => setSelectedId(0);
  const handleShow = (id) => setSelectedId(id);

  const showResponses = () => {
    //setCurrentImage(0);
    //setViewerIsOpen(false);
  };

  const options = {
    scales: {
      yAxes: [{}],
      xAxes: [
        {
          barThickness: 10,
          maxBarThickness: 18,
          ticks: { min: 0, precision: 0 },
          barPercentage: 0.5,
        },
      ],
    },
  };
  var randomColor = require("randomcolor"); // import the script
  let color = "#1e9ed9"; //randomColor({hue: 'blue'});
  return (
    <>
      <Row>
        <Col>
          <h3> {translate("report_activity_label", userInterfaceText)}: {props.project_activity.project_activity_name} </h3>
          <br />
          <Row  style={{ height: "100%" }}>
            {props.project_activity.project_activity_graphs.map((graph) => (
              <Col md={4} key={graph.question_id}>
                {/* Bar Chart */}
                <div className="card shadow mb-4">
                  <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">
                      {graph.question_text}
                    </h6>
                  </div>
                  <div className="card-body" style={{ padding: "5px" }}>
                    <HorizontalBar
                      options={options}
                      data={graph.question_reponses_graph}
                    />
                  </div>
                  <div className="card-footer" style={{ padding: "5px" }}>
                    <Row>
                      <Col md={3}>
                        <Button
                          size="sm"
                          variant="info"
                          onClick={() =>
                            handleShow("graph-" + graph.question_id)
                          }
                        >
                          {translate("report_enlarge_graph_label", userInterfaceText)}
                        </Button>
                      </Col>
                      {graph.free_text_question && (
                        <Col md={3}>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleShow(graph.question_id)}
                          >
                            {translate("report_view_responses_label", userInterfaceText)}
                          </Button>
                        </Col>
                      )}
                      {graph.issue_notes && graph.issue_notes.length != 0 && (
                        <Col md={3}>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() =>
                              handleShow("issues-" + graph.question_id)
                            }
                          >
                            {translate("report_view_issues_label", userInterfaceText)} ({graph.issue_notes_count})
                          </Button>
                        </Col>
                      )}
                    </Row>
                  </div>
                </div>
                <br />
                <br />
                {graph.issue_notes && graph.issue_notes.length != 0 && (
                  <Modal
                    dialogClassName="modal-90w"
                    show={"issues-" + graph.question_id === select_id}
                    onHide={handleClose}
                    centered
                  >
                    <Modal.Header closeButton>
                      <Modal.Title>
                        {" "}
                        {graph.issue_notes_count} {translate("report_issue_modal_issues_for_label", userInterfaceText)} "
                        {graph.question_text}"
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Table striped bordered hover responsive variant="dark">
                        <thead>
                          <tr>
                            <th colspan="1">{translate("report_issue_modal_issue_id_label", userInterfaceText)}</th>
                            <th colspan="5">{translate("report_issue_modal_resolved_label", userInterfaceText)}</th>
                            <th colspan="3">{translate("report_response_modal_user_id_label", userInterfaceText)}</th>
                            <th colspan="3">{translate("report_issue_modal_note_label", userInterfaceText)}</th>
                            <th colspan="3">{translate("report_response_modal_date_label", userInterfaceText)}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {graph.issue_notes.map((issue) => (
                            <tr>
                              <td colspan="1">{issue.issue_id}</td>
                              <td colspan="5">
                                {issue.resolved ? translate("report_issue_modal_resolved_label", userInterfaceText) : translate("report_issue_modal_not_resolved_label", userInterfaceText)}
                              </td>
                              <td colspan="3">{issue.user_id}</td>
                              <td colspan="3">{issue.note}</td>
                              <td colspan="3">{issue.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Modal.Body>
                  </Modal>
                )}

                <Modal
                  dialogClassName="modal-90w"
                  show={"graph-" + graph.question_id === select_id}
                  onHide={handleClose}
                  centered
                >
                  <Modal.Header closeButton>
                    <Modal.Title>{graph.question_text}</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <HorizontalBar
                      options={options}
                      data={graph.question_reponses_graph}
                    />
                  </Modal.Body>
                </Modal>
                {graph.free_text_question && (
                  <Modal
                    dialogClassName="modal-90w"
                    show={graph.question_id === select_id}
                    onHide={handleClose}
                    centered
                  >
                    <Modal.Header closeButton>
                      <Modal.Title>{graph.question_text}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Table striped bordered hover responsive variant="dark">
                        <thead>
                          <tr>
                            <th colspan="1">{translate("report_response_modal_user_id_label", userInterfaceText)}</th>
                            <th colspan="5">{translate("report_response_modal_response_label", userInterfaceText)}</th>
                            <th colspan="3">{translate("report_response_modal_date_label", userInterfaceText)}</th>
                            <th colspan="3">{translate("report_response_modal_project_label", userInterfaceText)}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {graph.responses.map((response) => (
                            <tr>
                              <td colspan="1">{response.user_id}</td>
                              <td colspan="5">{response.response}</td>
                              <td colspan="3">{response.date}</td>
                              <td colspan="3">{response.project}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Modal.Body>
                  </Modal>
                )}
              </Col>
            ))}
            {/* {props.lastOne && (
              <Waypoint
                debug={true}
                scrollableAncestor={window}
                topOffset={"95%"}
                onEnter={function (props) {
                  alert("Yes");
                  //alert(props.currentPosition);
                  //setTimeout(setTest(true), 5000);

                  // here you can use `props.currentPosition`, `props.previousPosition`, and
                  // `props.event`
                }}
              >
                <div>last</div>
              </Waypoint>
            )} */}
          </Row>
        </Col>
      </Row>
    </>
  );
}

export default MultiChoiceGraph;
