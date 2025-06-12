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
} from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { grey } from "@mui/material/colors";

const filter = createFilterOptions();

const TeamMaker = ({ teams }) => {
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [memberSkills, setMemberSkills] = useState({});
  const [allSkills, setAllSkills] = useState({});
  const [uploadedData, setUploadedData] = useState(null);

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/ankmay0/teamManager1/main/my-react-app/public/SkillsData.json"
    )
      .then((res) => res.json())
      .then((data) => {
        const grouped = {};
        data.forEach((skill) => {
          if (!grouped[skill.employeeId]) {
            grouped[skill.employeeId] = [];
          }
          grouped[skill.employeeId].push(skill);
        });
        setAllSkills(grouped);
        //{101: [{expertise: "frontend", experience: "2 years"} , {Expertise : "backend" , experience: "8yeras"}] , 102: [{expertise: "backend", experience: "3 years"} , {Expertise : "frontend" , experience: "5yeras"}] , 201: [{expertise: "backend", experience: "3 years"} , {Expertise : "frontend" , experience: "5yeras"}]..... }

      });
  }, []);

 const toggleCheckbox = (id) => {
  
  setSelectedTeams((prev) => {
    if (prev.includes(id)) {
      // Remove id from selectedTeams
      // And also remove from memberSkills
      setMemberSkills((prevSkills) => {
        const updated = { ...prevSkills };
        delete updated[id];
        return updated;
      });
      return prev.filter((x) => x !== id);
    } else {
      // Add id to selectedTeams
      return [...prev, id];
    }
    
    //{pairing-0: {101: {expertise: "frontend", experience: "2 years"} , 102: {Expertise : "backend" , experience: "8yeras"} } , pairing-1: {201: {expertise: "backend", experience: "3 years"} , 202: {Expertise : "frontend" , experience: "5yeras"} } }
  });
};


  const addSkill = (memberId, expertise) => {
    const newSkill = {
      id: Date.now(),
      employeeId: memberId,
      expertise,
      experience: "N/A",
    };
    setAllSkills((prev) => ({
      ...prev,
      [memberId]: [...(prev[memberId] || []), newSkill],
    }));
    return newSkill;
  };

  const updateSkill = (teamId, memberId, skill) => {
    setMemberSkills((prev) => ({
      ...prev,
      [teamId]: { ...(prev[teamId] || {}), [memberId]: skill },
      //pairing-0 : {  mayank : frontend}
    }));
  };

  return (
    <Container
      maxWidth="lg"
      sx={{ mt: 4, mb: 4, border: 1, borderColor: grey[400], borderRadius: 2 }}
    >
      <Typography
        variant="h3"
        fontWeight="bold"
        gutterBottom
        sx={{ mt: 7, mb: 4, textAlign: "center" }}
      >
        Team Skill Assignment
      </Typography>

      {teams?.length ? (
        <FormGroup>
          {teams.map((team, i) => {
            const pairingId = Pairing-${i};
            const ids = [team.srcId, team.targetId];
            const names = [team.srcName, team.targetName];
            const checked = selectedTeams.includes(pairingId);

            return (
              <Box key={pairingId} sx={{ py: 3 }}>
                <Grid container spacing={2} alignItems="center">
                  <Checkbox
                    checked={checked}
                    onChange={() => toggleCheckbox(pairingId)}
                  />
                  {ids.map((id, idx) => (
                    <Grid item key={id}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{ minWidth: 100, fontWeight: "bold" }}
                        >
                          {names[idx]}
                        </Typography>
                        <Autocomplete
                          disabled={!checked}
                          value={
                            memberSkills?.[pairingId]?.[id] || null
                            //memberSkills = {Pairing-0:{ {expertise: "frontend", experience: "2 years"} , {Expertise : "backend" , experience: "8yeras"} } , Pairing-1: {{expertise: "backend", experience: "3 years"} , {Expertise : "frontend" , experience: "5yeras"} }}
                          }
                          options={[
                            {
                              disabled: true,
                              expertise: "Skill",
                              experience: "Experience",
                            },
                            ...(allSkills[id] || []),
                          ]}
                          filterOptions={(opts, params) => {
                            const filtered = filter(opts, params);
                            if (
                              params.inputValue &&
                              !opts.some(
                                (o) =>
                                  o.expertise?.toLowerCase() ===
                                  params.inputValue.toLowerCase()
                              )
                            ) {
                              filtered.push({
                                inputValue: params.inputValue,
                                expertise: Add "${params.inputValue}",
                              });
                            }
                            return filtered;
                          }}
                          getOptionLabel={(option) =>
                            option.inputValue || option.expertise || ""
                          }
                          onChange={(e, val) => {
                            if (!val || val.disabled) return;
                            const skill =
                              typeof val === "string"
                                ? addSkill(id, val)
                                : (val.inputValue
                                ? addSkill(id, val.inputValue)
                                : val);
                            updateSkill(pairingId, id, skill);
                          }}
                          renderOption={(props, option) => (
                            <li
                              {...props}
                              key={option.id || option.inputValue}
                              style={{
                                fontWeight: option.disabled ? "bold" : "normal",
                                pointerEvents: option.disabled ? "none" : "auto",
                                display: "flex",
                                justifyContent: "space-between",
                                paddingRight: 16,
                                minWidth: 300,
                              }}
                            >
                              <span style={{ flex: "1 1 60%" }}>
                                {option.expertise}
                              </span>
                              <span style={{ flex: "1 1 40%", paddingLeft: 10 }}>
                                {option.experience || ""}
                              </span>
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Select or Add Expertise"
                              sx={{ minWidth: 300 }}
                            />
                          )}
                        />
                      </Box>
                    </Grid>
                  ))}
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

      <FileHandler
        selections={memberSkills}
        //{pairing-0: {101: {expertise: "frontend", experience: "2 years"} , 102: {Expertise : "backend" , experience: "8yeras"} } , pairing-1: {201: {expertise: "backend", experience: "3 years"} , 202: {Expertise : "frontend" , experience: "5yeras"} } }
        data={{
          ...uploadedData,
          skills: Object.values(allSkills).flat(),
        }}
        onDataUpload={setUploadedData}
      />
    </Container>
  );
};

export default TeamMaker;
