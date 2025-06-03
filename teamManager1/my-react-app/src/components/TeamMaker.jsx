import { useState, useEffect } from "react";
import FileHandler from "./FileHandler.jsx";
import {
  Container,
  Typography,
  FormGroup,
  Box,
  Grid,
  Checkbox,
  TextField,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Autocomplete,
} from "@mui/material";
import { grey } from "@mui/material/colors";

const TeamMaker = ({ teams }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [memberSkillSelections, setMemberSkillSelections] = useState({});
  const [skillsList, setSkillsList] = useState([]);
  const [uploadedDataContent, setUploadedDataContent] = useState(null);
  const [selectedTeams, setSelectedTeams] = useState([]);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newExpertise, setNewExpertise] = useState("");
  const [newExperience, setNewExperience] = useState("");
  const [pendingTeamMember, setPendingTeamMember] = useState({
    teamId: "",
    memberId: "",
  });

  const handleDataUpload = (uploaded) => {
    setUploadedDataContent(uploaded);
  };

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch(
          "https://raw.githubusercontent.com/ankmay0/teamManager1/main/my-react-app/public/SkillsData.json"
        );
        const result = await res.json();
        setSkillsList(result);
      } catch (error) {
        console.error("Failed to fetch skills:", error);
      }
    };
    fetchSkills();
  }, []);

  const handleSkillChange = (teamId, memberId, skillId) => {
    setMemberSkillSelections((prev) => ({
      ...prev,
      [teamId]: {
        ...(prev[teamId] || {}),
        [memberId]: skillId,
      },
    }));
  };

  function handleCheckboxChange(pairingIdentifier) {
    console.log(selectedTeams);
    if (isChecked) {
      setSelectedTeams((prev) => prev.filter((id) => id !== pairingIdentifier));
    } else {
      setSelectedTeams((prev) => [...prev, pairingIdentifier]);
    }
    setIsChecked(!isChecked);
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 4,
        mb: 4,
        border: "1px solid",
        borderColor: grey[400],
        borderRadius: 8,
      }}
    >
      <Typography
        variant="h3"
        fontWeight="bold"
        gutterBottom
        sx={{ mt: 7, mb: 4, textAlign: "center" }}
      >
        Team Skill Assignment
      </Typography>

      <Box sx={{ mb: 4 }}>
        {teams?.length ? (
          <FormGroup>
            {teams.map((team, index) => {
              const pairingIdentifier = `Pairing-${index}`;
              const memberIds = [team.srcId, team.targetId];
              const memberNames = [team.srcName, team.targetName];
              const isChecked = selectedTeams.includes(pairingIdentifier);

              return (
                <Box key={pairingIdentifier} sx={{ py: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Checkbox
                      checked={isChecked}
                      onChange={() => handleCheckboxChange(pairingIdentifier)}
                    />
                    {memberIds.map((memberId, idx) => {
                      const filteredSkills = skillsList.filter(
                        (skill) => skill.employeeId === memberId
                      );


                      const selectedSkillId =
                        memberSkillSelections[pairingIdentifier]?.[memberId];
                      const selectedSkill =
                        filteredSkills.find(
                          (skill) => skill.id === selectedSkillId
                        ) || null;


                      return (
                        <Grid item xs={12} sm={6} key={memberId}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="h6"
                              sx={{
                                whiteSpace: "nowrap",
                                minWidth: 100,
                                fontWeight: "bold",
                              }}
                            >
                              {memberNames[idx]}
                            </Typography>
                            <Autocomplete
                              disabled={!isChecked}
                              options={filteredSkills}
                              getOptionLabel={(option) => option.expertise}
                              //isOptionEqualToValue={(option, value) => option.id === value.id}

                              //value={selectedSkill}

                              onChange={(event, newValue) => {
                                if (!newValue) return;
                                if (newValue === "add_new") {
                                  setOpenAddDialog(true);
                                  setPendingTeamMember({
                                    teamId: pairingIdentifier,
                                    memberId,
                                  });
                                } else {
                                  handleSkillChange(
                                    pairingIdentifier,
                                    memberId,
                                    newValue.id
                                  );
                                }
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Select Expertise"
                                  variant="outlined"
                                  sx={{ minWidth: 400 }}
                                />
                              )}
                              renderOption={(props, option) => {
                                if (option === "add_new") {
                                  return (
                                    <li
                                      {...props}
                                      style={{
                                        fontWeight: "bold",
                                        borderTop: "1px solid #ccc",
                                        marginTop: 5,
                                      }}
                                    >
                                      ➕ Add New Expertise
                                    </li>
                                  );
                                }
                                return (
                                  <li {...props}>
                                    <Box
                                      sx={{ display: "flex", width: "100%" }}
                                    >
                                      <Box
                                        sx={{
                                          width: "50%",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        {option.expertise}
                                      </Box>
                                      <Box
                                        sx={{
                                          width: "50%",
                                          color: "text.secondary",
                                        }}
                                      >
                                        {option.experience}
                                      </Box>
                                    </Box>
                                  </li>
                                );
                              }}
                              filterOptions={(options, state) => {
                                const filtered = options.filter((option) =>
                                  option.expertise
                                    .toLowerCase()
                                    .includes(state.inputValue.toLowerCase())
                                );
                                return [...filtered, "add_new"];
                              }}
                            />
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                  <Divider
                    sx={{
                      mt: 4,
                      borderColor: "rgb(178, 176, 239)",
                      borderBottomWidth: 2,
                    }}
                  />
                </Box>
              );
            })}
          </FormGroup>
        ) : (
          <Typography sx={{ textAlign: "center", mt: 2 }}>
            No team data available.
          </Typography>
        )}
      </Box>

      <FileHandler
        selections={Object.fromEntries(
          selectedTeams.map((key) => [key, memberSkillSelections[key]])
        )}
        data={uploadedDataContent}
        onDataUpload={handleDataUpload}
      />

      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add New Expertise</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Expertise"
            fullWidth
            value={newExpertise}
            onChange={(e) => setNewExpertise(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Experience"
            fullWidth
            value={newExperience}
            onChange={(e) => setNewExperience(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              const newSkill = {
                id: Date.now(),
                employeeId: pendingTeamMember.memberId,
                expertise: newExpertise,
                experience: newExperience,
              };

              const alreadyExists = skillsList.some(
                (skill) =>
                  skill.employeeId === pendingTeamMember.memberId &&
                  skill.expertise.trim().toLowerCase() ===
                    newExpertise.trim().toLowerCase() &&
                  skill.experience.trim().toLowerCase() ===
                    newExperience.trim().toLowerCase()
              );

              if (alreadyExists) {
                alert(
                  "Skill with the same expertise and experience already exists for this member."
                );
                return;
              }

              setSkillsList((prev) => [...prev, newSkill]);
              handleSkillChange(
                pendingTeamMember.teamId,
                pendingTeamMember.memberId,
                newSkill.id
              );

              setOpenAddDialog(false);
              setNewExpertise("");
              setNewExperience("");
              setPendingTeamMember({ teamId: "", memberId: "" });
            }}
            disabled={!newExpertise || !newExperience}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeamMaker;
