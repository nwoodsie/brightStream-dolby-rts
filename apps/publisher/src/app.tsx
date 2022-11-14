import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  HStack,
  Select,
  Spacer,
  Stack,
  Switch,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import './styles/font.css';
import usePublisher from '@millicast-react/use-publisher';
import useMediaDevices from '@millicast-react/use-media-devices';
import {
  IconMicrophoneOn,
  IconMicrophoneOff,
  IconCameraOn,
  IconCameraOff,
  IconSettings,
  IconPresent,
  IconProfile,
} from '@millicast-react/dolbyio-icons';
import VideoView from '@millicast-react/video-view';
import ParticipantCount from '@millicast-react/participant-count';
import ShareLinkButton from '@millicast-react/share-link-button';
import MediaDeviceSelect from '@millicast-react/media-device-select';
import Timer from '@millicast-react/timer';
import IconButton from '@millicast-react/icon-button';
import React from 'react';
import ActionBar from '@millicast-react/action-bar';

const displayShareSourceId = 'DisplayShare';

function App() {
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const [isSimulcastEnabled, setIsSimulcastEnabled] = useState(false);

  const {
    setupPublisher,
    startStreaming,
    stopStreaming,
    updateStreaming,
    startDisplayStreaming,
    stopDisplayStreaming,
    codec,
    codecList,
    updateCodec,
    publisherState,
    viewerCount,
    linkText,
    statistics,
  } = usePublisher();

  const {
    cameraList,
    microphoneList,
    setCameraId,
    setMicrophoneId,
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
    mediaStream,
    startDisplayCapture,
    stopDisplayCapture,
    displayStream,
  } = useMediaDevices();

  useEffect(() => {
    setupPublisher(
      import.meta.env.VITE_MILLICAST_STREAM_PUBLISHING_TOKEN,
      import.meta.env.VITE_MILLICAST_STREAM_NAME,
      import.meta.env.VITE_MILLICAST_STREAM_ID
    );
  }, []);

  useEffect(() => {
    if (mediaStream) {
      updateStreaming(mediaStream);
    }
  }, [mediaStream]);

  useEffect(() => {
    if (!displayStream) stopDisplayStreaming();
    else if (publisherState === 'streaming')
      startDisplayStreaming({
        mediaStream: displayStream,
        sourceId: displayShareSourceId,
      });
  }, [displayStream, publisherState]);

  const onSelectCameraId = useCallback(
    (deviceId: string) => {
      setCameraId(deviceId);
    },
    [cameraList]
  );

  const onSelectMicrophoneId = useCallback(
    (deviceId: string) => {
      setMicrophoneId(deviceId);
    },
    [microphoneList]
  );

  const toggleShare = () => {
    displayStream ? stopDisplayCapture() : startDisplayCapture();
  };

  return (
    <Flex direction="column" minH="100vh" w="100vw" bg="background" p="6">
      <Box w="100%" h="96px">
        <ActionBar
          title="Company name"
          actionNode={
            publisherState == 'ready' || publisherState == 'connecting' ? (
              <Button
                test-id="startStreamingButton"
                px="2.5"
                size="sm"
                fontSize="12px"
                letterSpacing="1px"
                isLoading={publisherState == 'connecting'}
                onClick={() => {
                  if (publisherState == 'ready' && mediaStream) {
                    startStreaming({
                      mediaStream,
                      simulcast: isSimulcastEnabled,
                      codec,
                      events: ['viewercount'],
                    });
                    if (displayStream)
                      startDisplayStreaming({
                        mediaStream: displayStream,
                        sourceId: displayShareSourceId,
                      });
                  }
                }}
              >
                START
              </Button>
            ) : (
              <Button
                test-id="stopStreamingButton"
                px="2.5"
                size="sm"
                fontSize="12px"
                letterSpacing="1px"
                onClick={() => {
                  stopDisplayStreaming();
                  stopStreaming();
                }}
              >
                STOP STREAMING
              </Button>
            )
          }
        />
        <Flex w="100%" justifyContent="space-between">
          <Box>
            <Timer isActive={publisherState === 'streaming'} />
          </Box>
          {publisherState === 'streaming' && (
            <Box mt="3">
              <ParticipantCount count={viewerCount} />
            </Box>
          )}
        </Flex>
      </Box>
      <Flex flex="1" width="100%">
        <Stack direction="row" justifyContent="center" alignItems="center" w="100%" spacing="5">
          <Box position="relative">
            {publisherState !== 'streaming' && (
              <Box
                test-id="getStartedInfo"
                w="100%"
                textAlign="center"
                position="absolute"
                top="0"
                transform="translateY(-120%)"
              >
                <Heading test-id="getStartedInfoTitle" as="h2" fontSize="24px" fontWeight="600">
                  Get started
                </Heading>
                <Text test-id="getStartedInfoDesc" fontSize="15px" color="dolbySecondary.200" fontWeight="500">
                  Setup your audio and video before going live.
                </Text>
              </Box>
            )}
            <VideoView
              mirrored={true}
              muted={true}
              displayMuteButton={false}
              mediaStream={mediaStream}
              statistics={statistics}
              video={isVideoEnabled}
              label="Presenter"
              placeholderNode={
                <Box color="dolbyNeutral.700" position="absolute">
                  <IconProfile />
                </Box>
              }
            />
          </Box>
          {displayStream && <VideoView mediaStream={displayStream} />}
        </Stack>
      </Flex>
      <Box h="48px">
        <Flex direction="row" alignItems="center">
          <Box flex="1">
            <ShareLinkButton linkText={linkText} />
          </Box>
          <Stack direction="row" flex="1" justifyContent="center">
            <IconButton
              test-id="toggleMicrophoneButton"
              tooltip={{ label: 'Toggle microphone' }}
              onClick={toggleAudio}
              isActive={!isAudioEnabled}
              isDisabled={!(mediaStream && mediaStream.getAudioTracks().length)}
              icon={isAudioEnabled ? <IconMicrophoneOn /> : <IconMicrophoneOff />}
            />
            <IconButton
              test-id="toggleCameraButton"
              tooltip={{ label: 'Toggle camera' }}
              onClick={toggleVideo}
              isActive={!isVideoEnabled}
              isDisabled={!(mediaStream && mediaStream.getVideoTracks().length)}
              icon={isVideoEnabled ? <IconCameraOn /> : <IconCameraOff />}
            />
            <IconButton
              test-id="toggleShareButton"
              tooltip={{ label: 'Share' }}
              onClick={toggleShare}
              isActive={displayStream !== undefined}
              icon={<IconPresent />}
            />
          </Stack>
          <Flex flex="1" justifyContent="flex-end">
            <IconButton
              test-id="settingsButton"
              tooltip={{ label: 'Settings' }}
              onClick={onDrawerOpen}
              isDisabled={!(mediaStream && mediaStream.getVideoTracks().length)}
              icon={<IconSettings />}
              variant="transparent"
            />
          </Flex>
          {/* Drawer */}
          <Drawer isOpen={isDrawerOpen} placement="right" onClose={onDrawerClose}>
            <DrawerOverlay />
            <DrawerContent bg="dolbyNeutral.800" color="white">
              <DrawerHeader textAlign="center">Settings</DrawerHeader>
              <DrawerCloseButton />
              <DrawerBody>
                <Stack direction="column">
                  <Box>
                    <Text> Camera: </Text>
                    <Spacer />
                    {cameraList.length && (
                      <MediaDeviceSelect
                        disabled={publisherState === 'connecting'}
                        testId="camera-select"
                        deviceList={cameraList}
                        onSelectDeviceId={onSelectCameraId}
                      />
                    )}
                  </Box>
                  <Box>
                    <Text> Microphone: </Text>
                    <Spacer />
                    {microphoneList.length && (
                      <MediaDeviceSelect
                        disabled={publisherState === 'connecting'}
                        testId="microphone-select"
                        deviceList={microphoneList}
                        onSelectDeviceId={onSelectMicrophoneId}
                      />
                    )}
                  </Box>
                  <Box>
                    <Text> Codec </Text>
                    {
                      <Select
                        disabled={publisherState !== 'ready' || codecList.length === 0}
                        test-id="codecSelect"
                        defaultValue={codec || (codecList.length !== 0 ? codecList[0] : undefined)}
                        onChange={(e) => updateCodec(e.target.value)}
                      >
                        {codecList.map((codec: string) => {
                          return (
                            <option value={codec} key={codec}>
                              {codec}
                            </option>
                          );
                        })}
                      </Select>
                    }
                  </Box>
                  <Switch
                    test-id="simulcastSwitch"
                    onChange={() => setIsSimulcastEnabled(!isSimulcastEnabled)}
                    disabled={publisherState !== 'ready'}
                  >
                    Simulcast
                  </Switch>
                </Stack>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </Flex>
      </Box>
      <Box test-id="appVersion" position="fixed" bottom="5px" left="5px">
        <Text fontSize="12px">Version: {__APP_VERSION__} </Text>
      </Box>
    </Flex>
  );
}

export default App;
